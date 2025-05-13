from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from scanner import scan_target, generate_pdf_report
import os

app = Flask(__name__)
CORS(app)

@app.route("/scan", methods=["POST"])
def scan():
    data = request.json
    target = data.get("target")

    if not target:
        return jsonify({"error": "No target provided"}), 400

    results = scan_target(target)

    # Generate the report
    report_file = generate_pdf_report(target, results)

    # Send JSON + PDF path (we’ll serve it separately)
    return jsonify({
        "results": results,
        "pdf": f"http://localhost:5000/report/{os.path.basename(report_file)}"
    })

@app.route("/report/<filename>")
def report(filename):
    return send_file(f"./{filename}", as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
