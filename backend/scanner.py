import nmap
import requests
from fpdf import FPDF

def check_cve(service):
    url = f"https://cve.circl.lu/api/search/{service}"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()

        cve_list = []
        if data:
            for item in data[:3]:
                cve_list.append({
                    "id": item['id'],
                    "summary": item['summary']
                })
        return cve_list
    except:
        return []

def scan_target(target):
    scanner = nmap.PortScanner()
    scanner.scan(target, '1-1000', arguments='-sV')
    results = []

    for host in scanner.all_hosts():
        for proto in scanner[host].all_protocols():
            ports = scanner[host][proto].keys()
            for port in sorted(ports):
                service = scanner[host][proto][port]['name']
                cves = check_cve(service)
                results.append({
                    "port": port,
                    "service": service,
                    "cves": cves
                })
    return results

def generate_pdf_report(target, results, filename="report.pdf"):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(200, 10, txt="Vulnerability Scan Report", ln=True, align='C')

    pdf.set_font("Arial", "", 12)
    pdf.cell(200, 10, txt=f"Target: {target}", ln=True)

    for r in results:
        pdf.set_font("Arial", "B", 12)
        pdf.cell(200, 10, txt=f"Port: {r['port']} | Service: {r['service']}", ln=True)
        pdf.set_font("Arial", "", 11)

        if r["cves"]:
            for cve in r["cves"]:
                pdf.multi_cell(0, 10, txt=f"- {cve['id']}: {cve['summary']}")
        else:
            pdf.cell(200, 10, txt="- No CVEs found", ln=True)

        pdf.ln(5)

    pdf.output(filename)
    return filename
