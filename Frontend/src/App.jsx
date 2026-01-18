import { useRef, useState, useEffect } from "react";

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  /* Draw bounding boxes with hover highlight */
  const drawBoxes = (detections, highlightIndex = null) => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !detections || detections.length === 0) return;

    const ctx = canvas.getContext("2d");

    const width = image.clientWidth;
    const height = image.clientHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const scaleX = width / image.naturalWidth;
    const scaleY = height / image.naturalHeight;

    ctx.font = "12px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

    detections.forEach((det, i) => {
      const { x1, y1, x2, y2 } = det.box;

      const bx = x1 * scaleX;
      const by = y1 * scaleY;
      const bw = (x2 - x1) * scaleX;
      const bh = (y2 - y1) * scaleY;

      const isActive = i === highlightIndex;

      ctx.lineWidth = isActive ? 4 : 2;
      ctx.strokeStyle = isActive ? "#facc15" : "#22c55e";

      ctx.strokeRect(bx, by, bw, bh);

      const label = `${det.object} ${Math.round(det.confidence * 100)}%`;
      const padding = 6;
      const textWidth = ctx.measureText(label).width;

      const labelX = bx;
      const labelY = by - 24 < 0 ? by + 18 : by - 18;

      ctx.fillStyle = isActive ? "rgba(250,204,21,0.95)" : "rgba(34,197,94,0.9)";
      ctx.fillRect(labelX, labelY - 14, textWidth + padding * 2, 20);

      ctx.fillStyle = "#0f172a";
      ctx.fillText(label, labelX + padding, labelY);
    });
  };

  /* Redraw on hover change or when result updates */
  useEffect(() => {
    if (result?.detections) {
      drawBoxes(result.detections, hoveredIndex);
    }
  }, [hoveredIndex, result]);

  /* Handle window resize to redraw canvas */
  useEffect(() => {
    const handleResize = () => {
      if (result?.detections) {
        drawBoxes(result.detections, hoveredIndex);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [result, hoveredIndex]);

  const uploadImage = async () => {
    if (!imageFile || loading) return;

    setLoading(true);
    setResult(null);
    setHoveredIndex(null);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "object");

      const cloudRes = await fetch(
        "https://api.cloudinary.com/v1_1/dtbytfxzs/image/upload",
        { method: "POST", body: formData }
      );
      
      if (!cloudRes.ok) {
        throw new Error("Failed to upload image to Cloudinary");
      }
      
      const cloudData = await cloudRes.json();

      const backendRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/detect`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: cloudData.secure_url,
          }),
        }
      );

      if (!backendRes.ok) {
        throw new Error("Detection API request failed");
      }

      const backendData = await backendRes.json();
      setResult(backendData);
    } catch (err) {
      console.error(err);
      alert(`Detection failed: ${err.message}. Please check console and backend.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,_#1e293b,_#020617)] text-slate-100 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-6 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.9)]" />
            Realtime Vision
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-50">
            Vision<span className="text-emerald-400">Sense</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Smart object detection with real-time visual intelligence
          </p>
        </header>

        {/* Main card – becomes side‑by‑side on md+ */}
        <main className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
          {/* Left: Image / Preview panel */}
          <section className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-[0_18px_60px_rgba(15,23,42,0.8)] overflow-hidden backdrop-blur-xl">
            <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-slate-100">
                  Preview
                </h2>
                <p className="text-[11px] text-slate-400">
                  Image with detected bounding boxes
                </p>
              </div>
              {result && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {result.detections?.length || 0} objects detected
                </span>
              )}
            </div>

            <div className="p-4 sm:p-5">
              {!result && (
                <div className="border border-dashed border-slate-700 rounded-xl px-4 py-10 text-center flex flex-col items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-emerald-300 text-xl">
                    🔍
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    No image selected
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Choose an image on the right and click "Detect Objects" to see bounding boxes here.
                  </p>
                </div>
              )}

              {result && (
                <div className="flex justify-center">
                  <div className="relative inline-block bg-black/80 rounded-xl overflow-hidden max-h-[420px] w-full sm:w-auto">
                    <img
                      ref={imageRef}
                      src={result.image_url}
                      alt="Uploaded"
                      onLoad={() => {
                        // Small delay to ensure image is rendered
                        setTimeout(() => drawBoxes(result.detections, hoveredIndex), 10);
                      }}
                      className="max-h-[420px] w-full object-contain block"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 pointer-events-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right: Controls + List */}
          <section className="space-y-4">
            {/* Upload card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.75)]">
              <h2 className="text-sm font-medium text-slate-100 mb-1">
                Upload image
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Supported formats: JPG, PNG, WEBP. Larger images may take a few seconds to process.
              </p>

              <label
                htmlFor="image-file"
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 px-4 py-6 text-center cursor-pointer hover:border-emerald-400/60 hover:bg-slate-900 transition-colors"
              >
                <div className="h-11 w-11 rounded-2xl bg-slate-800/80 flex items-center justify-center text-emerald-300 group-hover:text-emerald-200">
                  ⬆️
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-100">
                    Click to choose an image
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Or drag &amp; drop from your desktop
                  </p>
                </div>
                {imageFile && (
                  <p className="mt-1 text-[11px] text-emerald-300 truncate max-w-full">
                    Selected: {imageFile.name}
                  </p>
                )}
              </label>
              <input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0] || null)}
                className="hidden"
              />

              <button
                onClick={uploadImage}
                disabled={loading || !imageFile}
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 ${
                  loading || !imageFile
                    ? "bg-emerald-600/40 text-emerald-100 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                }`}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-emerald-100/70 border-t-transparent rounded-full animate-spin" />
                    Detecting…
                  </>
                ) : (
                  <>
                    <span>Detect Objects</span>
                    <span className="text-base">🎯</span>
                  </>
                )}
              </button>

              <p className="mt-2 text-[11px] text-slate-500">
                Your image is uploaded to Cloudinary and processed by a local backend for inference.
              </p>
            </div>

            {/* Detected objects list */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl h-full">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-sm font-medium text-slate-100">
                  Detected objects
                </h2>
                {result?.detections && result.detections.length > 0 && (
                  <span className="text-[11px] text-slate-400">
                    Highest:{" "}
                    <span className="text-emerald-300 font-medium">
                      {Math.round(
                        Math.max(
                          ...result.detections.map((d) => d.confidence || 0)
                        ) * 100
                      )}
                      %
                    </span>
                  </span>
                )}
              </div>

              {!result && (
                <p className="text-xs text-slate-500">
                  Results will appear here after running detection on an image.
                </p>
              )}

              {result && (!result.detections || result.detections.length === 0) && (
                <p className="text-xs text-rose-300">
                  No objects detected. Try a different image or adjust backend thresholds.
                </p>
              )}

              {result?.detections && result.detections.length > 0 && (
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                  {result.detections.map((det, i) => (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`cursor-pointer rounded-lg px-3 py-2 text-xs sm:text-sm transition-colors ${
                        hoveredIndex === i
                          ? "bg-yellow-400/20 border border-yellow-400/40"
                          : "bg-slate-800/80 hover:bg-slate-700/90"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-medium text-slate-100">
                          {det.object}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              hoveredIndex === i ? "bg-yellow-400" : "bg-emerald-400"
                            }`}
                          />
                          {Math.round(det.confidence * 100)}%
                        </span>
                      </div>
                      {det.description && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          {det.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;