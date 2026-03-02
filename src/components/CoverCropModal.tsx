import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
import { X, Check } from 'lucide-react';

interface CoverCropModalProps {
    imageSrc: string;
    onClose: () => void;
    onCropComplete: (croppedBlob: Blob) => void;
}

export function CoverCropModal({ imageSrc, onClose, onCropComplete }: CoverCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleValidation = useCallback(async () => {
        if (!croppedAreaPixels || isProcessing) return;
        setIsProcessing(true);

        try {
            const croppedImage = await createCroppedImage(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                // Convert data URL to Blob
                const fetchRes = await fetch(croppedImage);
                const blob = await fetchRes.blob();
                onCropComplete(blob);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    }, [croppedAreaPixels, imageSrc, onCropComplete, isProcessing]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-xl font-bold text-fixup-black">Ajuster la couverture</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Cropper Container */}
                <div className="relative flex-1 bg-gray-900 w-full">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={4} // 4:1 aspect ratio matches the h-48 height on wide screens roughly, adjust if needed
                        onCropChange={setCrop}
                        onCropComplete={handleCropComplete}
                        onZoomChange={setZoom}
                        objectFit="horizontal-cover"
                    />
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                        <label className="text-sm text-gray-600 mb-2 block">Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full accent-fixup-orange"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex-1 sm:flex-none"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleValidation}
                            disabled={isProcessing}
                            className="px-6 py-2 bg-fixup-orange text-white rounded-lg font-medium hover:bg-orange-600 flex items-center justify-center gap-2 flex-1 sm:flex-none disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Valider
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Utility to crop image
async function createCroppedImage(imageSrc: string, crop: Area): Promise<string | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
    );

    return canvas.toDataURL('image/jpeg', 0.9);
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}
