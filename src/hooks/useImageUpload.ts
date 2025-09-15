import { useState, useEffect, useCallback,useRef } from "react";
import { FormikHelpers } from "formik";
import { TicketForm } from "@/lib/ticket/TicketTypes";
import { FILE_RULES, bytes, isAcceptedMime } from "@/app/shared/ticket/schemas/form";

export function useImageUpload() {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploadError, setUploadError] = useState<string>("");

    // 🔑 ref untuk reset <input type="file" />
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // generate preview URL
    useEffect(() => {
        const urls = selectedImages.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [selectedImages]);

    // Handler upload
    const handleUpload = useCallback(
        (
            files: FileList | null,
            setFieldValue: FormikHelpers<TicketForm>["setFieldValue"]
        ) => {
            if (!files) return;
            const arr = Array.from(files);

            // size check
            if (arr.some((f) => f.size > bytes(FILE_RULES.maxMB))) {
                setUploadError(`Each file must be <= ${FILE_RULES.maxMB} MB`);
                return;
            }

            // mime check
            if (arr.some((f) => !isAcceptedMime(f.type))) {
                setUploadError("Unsupported file type");
                return;
            }

            const limit = FILE_RULES.maxFiles - selectedImages.length;
            const next = [...selectedImages, ...arr.slice(0, limit)];
            setSelectedImages(next);

            const dt = new DataTransfer();
            next.forEach((f) => dt.items.add(f));
            setFieldValue("images", dt.files, true);

            setUploadError(arr.length > limit ? `Max ${FILE_RULES.maxFiles} files allowed` : "");
        },
        [selectedImages]
    );

    // Handler remove
    const handleRemove = useCallback(
        (
            i: number,
            setFieldValue: FormikHelpers<TicketForm>["setFieldValue"]
        ) => {
            const next = selectedImages.filter((_, idx) => idx !== i);
            setSelectedImages(next);

            const dt = new DataTransfer();
            next.forEach((f) => dt.items.add(f));
            setFieldValue("images", dt.files, true);

            setUploadError("");
        },
        [selectedImages]
    );

    // Handler reset semua image
    const handleReset = useCallback(
        (setFieldValue: FormikHelpers<TicketForm>["setFieldValue"]) => {
            setSelectedImages([]);
            setPreviews([]);
            setUploadError("");
            setFieldValue("images", new DataTransfer().files, true);

            // penting! reset juga value input file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
        []
    );

    return {
        handleReset,
        selectedImages,
        previews,
        uploadError,
        setUploadError,
        handleUpload,
        handleRemove,
        fileInputRef
    };
}
