import React, { useState, ChangeEvent } from 'react';
import { Logo } from '../components/Logo';
import { API_BASE_URL } from '../config/api';
import { Footer } from '../components/Footer';

type UserType = 'particular' | 'professional';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  postalCode: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  activityDomain?: string;
  attestation?: File | null;
}

export function Register() {
  const [formData, setFormData] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    postalCode: '',
    password: '',
    confirmPassword: '',
    userType: 'particular',
    activityDomain: '',
    attestation: null
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        attestation: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const hasFile = formData.attestation instanceof File;

      let response: Response;

      if (hasFile) {
        // multipart/form-data si fichier présent
        const formDataToSend = new FormData();
        formDataToSend.append('Prenom', formData.firstName);
        formDataToSend.append('Nom', formData.lastName);
        formDataToSend.append('Email', formData.email);
        formDataToSend.append('Adresse', formData.address);
        formDataToSend.append('Code_postal', formData.postalCode);
        formDataToSend.append('motdepasse', formData.password);
        formDataToSend.append('Statut', 'actif');
        formDataToSend.append('Role', formData.userType === 'professional' ? 'professionnel' : 'particulier');
        if (formData.userType === 'professional' && formData.activityDomain) {
          formDataToSend.append('Domaine_activite', formData.activityDomain);
        }
        if (formData.attestation instanceof File) {
          formDataToSend.append('Attestation', formData.attestation);
        }

        const debugEntries: Array<{ key: string; value: string }> = [];
        for (const [k, v] of formDataToSend.entries()) {
          if (v instanceof File) {
            debugEntries.push({ key: k, value: `File(name=${v.name}, type=${v.type}, size=${v.size})` });
          } else {
            debugEntries.push({ key: k, value: String(v) });
          }
        }
        console.log('FormData entries:', debugEntries);

        response = await fetch(`${API_BASE_URL}/api/users/register`, {
          method: 'POST',
          body: formDataToSend
        });
      } else {
        // application/x-www-form-urlencoded si aucun fichier
        const urlParams = new URLSearchParams();
        urlParams.append('Prenom', formData.firstName);
        urlParams.append('Nom', formData.lastName);
        urlParams.append('Email', formData.email);
        urlParams.append('Adresse', formData.address);
        urlParams.append('Code_postal', formData.postalCode);
        urlParams.append('motdepasse', formData.password);
        urlParams.append('Statut', 'actif');
        urlParams.append('Role', formData.userType === 'professional' ? 'professionnel' : 'particulier');
        if (formData.userType === 'professional' && formData.activityDomain) {
          urlParams.append('Domaine_activite', formData.activityDomain);
        }

        console.log('URL-Encoded body:', urlParams.toString());

        response = await fetch(`${API_BASE_URL}/api/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: urlParams.toString()
        });
      }

      if (response.status === 200 || response.status === 201) {
        setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        const data = await response.json().catch(() => ({} as any));
        setError((data && (data.message || data.error)) || "Une erreur est survenue lors de l'inscription");
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Logo size="large" className="mb-8" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-4 text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            {formData.userType === 'particular'
              ? "Si vous êtes particulier et que vous avez un besoin de réparation, inscrivez-vous en tant que particulier."
              : "Si vous souhaitez proposer vos services, veuillez vous inscrire en tant que Pro en renseignant un certificat QualiRépar."}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                {success}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Code postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                  Type de compte
                </label>
                <select
                  name="userType"
                  id="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="particular">Particulier</option>
                  <option value="professional">Professionnel</option>
                </select>
              </div>

              {formData.userType === 'professional' && (
                <>
                  <div>
                    <label htmlFor="activityDomain" className="block text-sm font-medium text-gray-700">
                      Domaine d'activité
                    </label>
                    <input
                      type="text"
                      name="activityDomain"
                      id="activityDomain"
                      required
                      value={formData.activityDomain}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="attestation" className="block text-sm font-medium text-gray-700">
                      Attestation (PDF)
                    </label>
                    <input
                      type="file"
                      name="attestation"
                      id="attestation"
                      accept=".pdf"
                      required
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  S'inscrire
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Déjà inscrit ?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Se connecter
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer variant="dark" />
    </div>
  );
}