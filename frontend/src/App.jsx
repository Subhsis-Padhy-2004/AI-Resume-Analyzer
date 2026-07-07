import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Please select a PDF first!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      setLoading(true);

      const response = await axios.post(
        "https://ai-resume-analyzer-v4ix.onrender.com/upload",
        formData,
      );

      console.log("Backend Response:", response.data);

      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error(error);
      alert("Upload Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🤖 AI Resume Analyzer</h1>
      <p>Upload your resume and get AI-powered feedback.</p>

      <div className="uploadCard">
        <input type="file" accept=".pdf" onChange={handleFileChange} />

        <br />
        <br />

        <button onClick={handleAnalyze}>🚀 Analyze Resume</button>
      </div>

      {loading && (
        <div className="loading">
          <h2>⏳ AI is analyzing your resume...</h2>
        </div>
      )}

      {analysis && (
        <div className="dashboard">
          <div className="card">
            <h2>⭐ Resume Score</h2>

            <div className="scoreContainer">
              <div className="scoreCircle">
                <h1>{analysis?.score || 0}</h1>
                <span>/100</span>
              </div>

              <p className="scoreText">
                {(analysis?.score || 0) >= 80
                  ? "Excellent Resume ⭐"
                  : (analysis?.score || 0) >= 60
                    ? "Good Resume 👍"
                    : "Needs Improvement 📈"}
              </p>

              <div className="progress">
                <div
                  className="progressFill"
                  style={{
                    width: `${analysis?.score || 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>📄 Summary</h2>
            <p>{analysis?.summary || "Summary not available."}</p>
          </div>

          <div className="card">
            <h2>💪 Strengths</h2>

            {analysis.strengths?.length ? (
              <ul>
                {analysis.strengths.map((item, index) => (
                  <li key={index}>✅ {item}</li>
                ))}
              </ul>
            ) : (
              <p>No strengths available.</p>
            )}
          </div>

          <div className="card">
            <h2>⚠ Weaknesses</h2>

            {analysis.weaknesses?.length ? (
              <ul>
                {analysis.weaknesses.map((item, index) => (
                  <li key={index}>❌ {item}</li>
                ))}
              </ul>
            ) : (
              <p>No weaknesses available.</p>
            )}
          </div>

          <div className="card">
            <h2>❌ Missing Skills</h2>

            {analysis.missingSkills?.length ? (
              <ul>
                {analysis.missingSkills.map((item, index) => (
                  <li key={index}>📌 {item}</li>
                ))}
              </ul>
            ) : (
              <p>No missing skills found.</p>
            )}
          </div>

          <div className="card">
            <h2>🚀 Suggestions</h2>

            {analysis.suggestions?.length ? (
              <ul>
                {analysis.suggestions.map((item, index) => (
                  <li key={index}>💡 {item}</li>
                ))}
              </ul>
            ) : (
              <p>No suggestions available.</p>
            )}
          </div>

          <div className="card">
            <h2>💼 Recommended Job Roles</h2>

            {analysis.jobRoles?.length ? (
              <ul>
                {analysis.jobRoles.map((item, index) => (
                  <li key={index}>👨‍💻 {item}</li>
                ))}
              </ul>
            ) : (
              <p>No job roles suggested.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
