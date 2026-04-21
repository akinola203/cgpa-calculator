export default function CGPADisplay({
  cgpa,
  totalCredits,
  scale,
  yearsCount,
  totalSemesters,
  studentName,
}) {
  const getClass = (cgpa) => {
    const val = parseFloat(cgpa);
    if (val >= 3.5) return "text-green-300";
    if (val >= 2.5) return "text-yellow-300";
    return "text-red-300";
  };

  const getHonors = (cgpa) => {
    const val = parseFloat(cgpa);
    if (scale === "5.0") {
      if (val >= 4.5) return "🎓 First Class Honours";
      if (val >= 3.5) return "📚 Second Class Upper";
      if (val >= 2.5) return "📖 Second Class Lower";
      if (val >= 2.0) return "✅ Third Class";
      return "⚠️ Pass";
    }
    if (val >= 3.5) return "🎓 First Class";
    if (val >= 3.0) return "📚 Second Class Upper";
    if (val >= 2.0) return "📖 Second Class Lower";
    return "⚠️ Pass";
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-8 text-center shadow-lg">
      {studentName && <p className="text-sm opacity-75 mb-2">{studentName}</p>}
      <h2 className="text-lg opacity-90 mb-2">Cumulative GPA (CGPA)</h2>
      <div className={`text-6xl font-bold mb-2 ${getClass(cgpa)}`}>{cgpa}</div>
      <p className="opacity-75 mb-4">
        {scale} Scale • {totalCredits} Total Units • {yearsCount} Years
      </p>
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="bg-white/10 rounded-lg p-2">
          <p className="opacity-75">Semesters</p>
          <p className="font-bold text-lg">{totalSemesters}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <p className="opacity-75">Years</p>
          <p className="font-bold text-lg">{yearsCount}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-2">
          <p className="opacity-75">Total Units</p>
          <p className="font-bold text-lg">{totalCredits}</p>
        </div>
      </div>
      <div className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur">
        {getHonors(cgpa)}
      </div>
    </div>
  );
}
