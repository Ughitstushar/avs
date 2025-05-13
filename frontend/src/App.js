import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [pdfUrl, setPdfUrl] = useState('');

  const handleScan = async () => {
    if (!target) {
      alert("Please enter a target IP or domain");
      return;
    }

    setLoading(true);
    setResults([]);
    setPdfUrl('');

    try {
      const response = await axios.post("http://localhost:5000/scan", { target });

      setResults(response.data.results);
      setPdfUrl(response.data.pdf);

      const fileResponse = await axios.get(response.data.pdf, { responseType: 'blob' });
      const blob = new Blob([fileResponse.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Scan_Report_${target}.pdf`;
      link.click();
    } catch (error) {
      console.error("Scan failed:", error);
      alert("Error while scanning.");
    }

    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="app-overlay">
        <h2>🛡️ Advanced Vulnerability Scanner</h2>

        <input
          type="text"
          placeholder="Enter target IP or domain"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />

        <button onClick={handleScan} disabled={loading}>
          {loading ? "Scanning..." : "Scan & Download PDF"}
        </button>

        {loading && (
  <div className="loading-container">
    <p className="loading-text">Scanning for vulnerabilities...</p>
    <div className="dots-loading">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
)}


        {results.length > 0 && (
          <div className="results">
            <h3>🔍 Scan Results for {target}</h3>
            {results.map((r, i) => (
              <div key={i} className="card">
                <strong>Port:</strong> {r.port}<br />
                <strong>Service:</strong> {r.service}<br />
                <strong>CVEs:</strong>
                {r.cves.length > 0 ? (
                  <ul>
                    {r.cves.map((cve, idx) => (
                      <li key={idx}>
                        <strong>{cve.id}</strong>: {cve.summary}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>No CVEs found ✅</div>
                )}
              </div>
            ))}

            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="report-link"
              >
                🔽 View Report PDF
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
