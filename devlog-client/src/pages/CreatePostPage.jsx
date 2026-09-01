/** Editor de publicaciones con validación local y carga opcional de imágenes. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../api/axios";
import Icon from "../components/Icon";

const MAX_CHARS = 1000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Mantiene preview y archivo por separado: la URL local nunca se persiste y se
 * revoca al desmontar para liberar memoria del navegador.
 */
function CreatePostPage() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const content = useWatch({ control, name: "content", defaultValue: "" });
  const remaining = MAX_CHARS - (content?.length || 0);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const selectImage = (file) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("La imagen debe pesar menos de 5MB");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) selectImage(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) selectImage(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
    setFileName("");
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("content", data.content);
      if (imageFile) {
        formData.append("image", imageFile);
      }
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("¡Post publicado!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al publicar");
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="btn-secondary h-10 w-10 min-h-0! p-0!"
        >
          <Icon name="arrowLeft" size={18} />
        </button>
        <div>
          <p className="eyebrow">Comparte con la comunidad</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Nueva publicación</h1>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-5 sm:p-6">
            <label htmlFor="post-content" className="mb-3 block text-sm font-semibold text-slate-700">
              ¿Qué quieres compartir?
            </label>
            <textarea
              id="post-content"
              {...register("content", {
                required: "Escribe algo para publicar",
                maxLength: {
                  value: MAX_CHARS,
                  message: `Máximo ${MAX_CHARS} caracteres`,
                },
              })}
              rows={7}
              placeholder="Un avance, una decisión técnica, algo que aprendiste..."
              className="w-full resize-none bg-transparent text-[15px] leading-7 text-slate-800 placeholder-slate-300 focus:outline-none"
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="mx-auto max-h-[30rem] w-[calc(100%-2rem)] rounded-2xl object-cover sm:w-[calc(100%-3rem)]"
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Quitar imagen"
                className="absolute top-3 right-6 sm:right-8 bg-slate-950/75 text-white rounded-xl w-9 h-9 flex items-center justify-center hover:bg-slate-950 transition text-sm backdrop-blur"
              >
                <Icon name="close" size={17} />
              </button>
              <p className="absolute bottom-3 left-6 sm:left-8 max-w-[70%] truncate text-white text-xs bg-slate-950/65 px-2.5 py-1 rounded-lg backdrop-blur">
                {fileName}
              </p>
            </div>
          )}

          {!preview && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`mx-5 sm:mx-6 mb-5 sm:mb-6 border border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragging
                  ? "border-[#91bd2a] bg-[#f3ffda]"
                  : "border-[#d9ddd5] bg-[#f8f9f5] hover:border-[#b2c878] hover:bg-[#f5fbe8]"
              }`}
            >
              <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#668b12] shadow-sm"><Icon name="image" size={20} /></div>
              <p className="text-slate-500 text-sm">
                Arrastra una imagen aquí o{" "}
                <label className="text-[#668b12] font-semibold cursor-pointer hover:text-[#405a07]">
                  selecciona un archivo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </p>
              <p className="text-slate-400 text-xs mt-2">
                JPG, PNG o WEBP · Máx 5MB
              </p>
            </div>
          )}

          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span
              className={`text-xs font-mono ${remaining < 20 ? "text-red-500" : remaining < 50 ? "text-amber-500" : "text-slate-400"}`}
            >
              {remaining} caracteres restantes
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || remaining < 0}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publicando...
                  </>
                ) : (
                  "Publicar"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;
