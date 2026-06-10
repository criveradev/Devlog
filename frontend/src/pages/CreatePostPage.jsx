import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "../api/axios";

const MAX_CHARS = 1000;

function CreatePostPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const content = watch("content", "");
  const remaining = MAX_CHARS - (content?.length || 0);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 5MB");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setFileName("");
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("content", data.content);
      if (data.image?.[0]) {
        formData.append("image", data.image[0]);
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
    <div className="max-w-lg mx-auto pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900">Nueva publicación</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Área de texto */}
          <div className="p-4">
            <textarea
              {...register("content", {
                required: "Escribe algo para publicar",
                maxLength: {
                  value: MAX_CHARS,
                  message: `Máximo ${MAX_CHARS} caracteres`,
                },
              })}
              rows={5}
              placeholder="¿Qué estás pensando?"
              className="w-full text-gray-800 text-sm leading-relaxed placeholder-gray-300 focus:outline-none resize-none"
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Preview de imagen */}
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-72 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80 transition text-sm"
              >
                ✕
              </button>
              <p className="absolute bottom-2 left-3 text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">
                {fileName}
              </p>
            </div>
          )}

          {/* Zona de drop si no hay imagen */}
          {!preview && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`mx-4 mb-4 border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                dragging
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="text-gray-400 text-sm">
                Arrastra una imagen aquí o{" "}
                <label className="text-blue-500 cursor-pointer hover:underline">
                  selecciona un archivo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    {...register("image")}
                    onChange={(e) => {
                      register("image").onChange(e);
                      handleImageChange(e);
                    }}
                  />
                </label>
              </p>
              <p className="text-gray-300 text-xs mt-1">
                JPG, PNG o WEBP · Máx 5MB
              </p>
            </div>
          )}

          {/* Footer del formulario */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span
              className={`text-xs font-mono ${remaining < 50 ? "text-orange-500" : remaining < 20 ? "text-red-500" : "text-gray-400"}`}
            >
              {remaining} caracteres restantes
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || remaining < 0}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
