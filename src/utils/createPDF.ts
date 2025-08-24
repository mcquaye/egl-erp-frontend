import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

// NOTE: If you have an app-level company name/logo, replace these with the correct values or
// pass them into createPDF via an options param. Using a small logo and JPEG output + lower
// canvas scale reduces the final PDF file size significantly.
const COMPANY_NAME = "Your Company Name"; // <--- change as needed
const DEFAULT_LOGO_PATH = `${window.location.origin}/favicon.png`;

export const createPDF = async (
	jobCard: any,
	options?: { companyName?: string; logoSrc?: string }
) => {
	try {
		toast.info("Generating PDF...");

		const companyName = options?.companyName || COMPANY_NAME;
		const logoSrc = options?.logoSrc || DEFAULT_LOGO_PATH;

		const tempDiv = document.createElement("div");
		// Keep the output width close to A4 proportions but not huge in pixels.
		// 595px ≈ A4 width at 72 DPI. We will use a modest scale in html2canvas to keep pixels low.
		tempDiv.style.width = "595px";
		tempDiv.style.padding = "18px";
		tempDiv.style.backgroundColor = "white";
		tempDiv.style.fontFamily = "Arial, sans-serif";
		tempDiv.style.color = "#111827";
		tempDiv.style.boxSizing = "border-box";

		// Limit any embedded images' width to avoid creating enormous canvases.
		const safeImgStyle =
			"max-width: 540px; width:100%; height:auto; border-radius:8px; border:1px solid #e5e7eb; display:block;";

		const safeDate = (d: any) => (d ? new Date(d).toLocaleDateString() : "N/A");

		tempDiv.innerHTML = `
			<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
				<div style="display:flex; align-items:center; gap:12px;">
					<img src="${logoSrc}" alt="logo" style="width:60px; height:auto; object-fit:contain; border-radius:8px;" />
					<div style="font-size:18px; font-weight:600;">${companyName}</div>
				</div>
				<div style="font-size:12px; color:#6b7280;">Generated: ${new Date().toLocaleString()}</div>
			</div>

			<div style="text-align: center; margin-bottom: 10px;">
				<h2 style="color: #1f2937; margin: 0; font-size:16px;">Job Card Report</h2>
			</div>

			<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
				<h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 12px; font-size:13px;">Job Information</h3>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size:12px;">
					<div><strong>Job Number:</strong> ${jobCard.jobNumber || "N/A"}</div>
					<div><strong>Serial Number:</strong> ${jobCard.serialNumber || "N/A"}</div>
					<div><strong>Status:</strong> ${jobCard.jobStatus || "N/A"}</div>
					<div><strong>Job Date:</strong> ${safeDate(jobCard.jobDate)}</div>
				</div>
			</div>

			<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; font-size:12px;">
				<h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 12px; font-size:13px;">Customer Information</h3>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
					<div><strong>Customer Name:</strong> ${jobCard.customerName || "N/A"}</div>
					<div><strong>Customer Code:</strong> ${jobCard.customerCode || "N/A"}</div>
					<div><strong>Contact Person:</strong> ${jobCard.contactPerson || "N/A"}</div>
					<div><strong>Contact Number:</strong> ${jobCard.contactNumber || "N/A"}</div>
					<div style="grid-column: 1 / -1;"><strong>Email:</strong> ${jobCard.email || "N/A"}</div>
				</div>
			</div>

			<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; font-size:12px;">
				<h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 12px; font-size:13px;">Product Information</h3>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
					<div><strong>Item Code:</strong> ${jobCard.itemCode || "N/A"}</div>
					<div><strong>Brand:</strong> ${jobCard.brand || "N/A"}</div>
					<div style="grid-column: 1 / -1;"><strong>Description:</strong> ${
						jobCard.description || "N/A"
					}</div>
					<div><strong>Quantity:</strong> ${jobCard.qty || "N/A"}</div>
					<div><strong>Classification:</strong> ${jobCard.classification || "N/A"}</div>
					<div><strong>Group:</strong> ${jobCard.group || "N/A"}</div>
				</div>
			</div>

			<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; font-size:12px;">
				<h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 12px; font-size:13px;">Delivery Information</h3>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
					<div><strong>Invoice No:</strong> ${jobCard.invoiceNo || "N/A"}</div>
					<div><strong>Invoice Date:</strong> ${safeDate(jobCard.invoiceDate)}</div>
					<div><strong>Delivery No:</strong> ${jobCard.deliveryNo || "N/A"}</div>
					<div><strong>Delivery Date:</strong> ${safeDate(jobCard.deliveryDate)}</div>
				</div>
			</div>

			${
				jobCard.remarks
					? `
				<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; font-size:12px;">
					<h3 style="color: #1f2937; padding-bottom: 6px; margin-bottom: 8px; font-size:13px;">Remarks</h3>
					<p style="margin:0; line-height: 1.4;">${jobCard.remarks}</p>
				</div>
			`
					: ""
			}

			<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; font-size:12px;">
				<h3 style="color: #1f2937; padding-bottom: 6px; margin-bottom: 8px; font-size:13px;">System Information</h3>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
					<div><strong>Created By:</strong> ${jobCard.username || "N/A"}</div>
					<div><strong>Branch:</strong> ${jobCard.branch || "N/A"}</div>
					<div><strong>Created At:</strong> ${safeDate(jobCard.createdAt)}</div>
				</div>
			</div>

			${
				jobCard.gpsLocation
					? `
				<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; font-size:12px;">
					<h3 style="color: #1f2937; padding-bottom: 6px; margin-bottom: 8px; font-size:13px;">GPS Location</h3>
					<p style="margin:0;">📍 ${jobCard.gpsLocation}</p>
				</div>
			`
					: ""
			}

			${
				jobCard.serialImage
					? `
				<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
					<h3 style="color: #1f2937; margin-bottom: 8px; font-size:13px;">Serial Image</h3>
					<img src="${jobCard.serialImage}" alt="Serial Image" style="${safeImgStyle}" />
				</div>
			`
					: ""
			}

			${
				jobCard.indoorImage
					? `
				<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
					<h3 style="color: #1f2937; margin-bottom: 8px; font-size:13px;">Indoor Scene</h3>
					<img src="${jobCard.indoorImage}" alt="Indoor" style="${safeImgStyle}" />
				</div>
			`
					: ""
			}

			${
				jobCard.outdoorImage
					? `
				<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
					<h3 style="color: #1f2937; margin-bottom: 8px; font-size:13px;">Outdoor Scene</h3>
					<img src="${jobCard.outdoorImage}" alt="Outdoor" style="${safeImgStyle}" />
				</div>
			`
					: ""
			}

			${
				jobCard.signature
					? `
				<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; background:#fff;">
					<h3 style="color: #1f2937; margin-bottom: 8px; font-size:13px;">Customer Signature</h3>
					<img src="${jobCard.signature}" alt="Signature" style="${safeImgStyle} background:#fff;" />
				</div>
			`
					: ""
			}

			${
				jobCard.consent || jobCard.consentMessageOne
					? `
				<div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; font-size:12px;">
					<h3 style="color: #1f2937; margin-bottom: 8px; font-size:13px;">Consent</h3>
					<p style="margin:0 0 8px 0;">Consent given: <strong>${jobCard.consent ? "Yes" : "No"}</strong></p>
					<p style="white-space:pre-wrap; margin:0;">${jobCard.consentMessageOne || ""}</p>
				</div>
			`
					: ""
			}
		`;

		tempDiv.style.position = "absolute";
		tempDiv.style.left = "-9999px";
		document.body.appendChild(tempDiv);

		// Lower scale and compress to JPEG to reduce PDF size.
		const canvas = await html2canvas(tempDiv, {
			scale: 1.2, // modest scale keeps pixel count down
			useCORS: true,
			allowTaint: true,
			backgroundColor: "#ffffff",
		});

		document.body.removeChild(tempDiv);

		// Convert to JPEG with quality to significantly reduce size vs PNG
		const imgData = canvas.toDataURL("image/jpeg", 0.72);

		const pdf = new jsPDF("p", "mm", "a4");
		const pageWidthMM = 210; // A4 width in mm
		const marginMM = 10;
		const imgWidth = pageWidthMM - marginMM * 2; // leave margins

		// calculate image height in mm based on canvas pixel ratio
		const pxToMm = (px: number) => (px * 25.4) / 96; // assume 96 DPI for conversion
		const imgHeight = pxToMm(canvas.height) * (imgWidth / pxToMm(canvas.width));
		const pageHeight = 297; // A4 height in mm

		let heightLeft = imgHeight;
		let position = marginMM;

		pdf.addImage(imgData, "JPEG", marginMM, position, imgWidth, imgHeight);
		heightLeft -= pageHeight - marginMM * 2;

		while (heightLeft > 0) {
			position = marginMM - (imgHeight - heightLeft);
			pdf.addPage();
			pdf.addImage(imgData, "JPEG", marginMM, position, imgWidth, imgHeight);
			heightLeft -= pageHeight - marginMM * 2;
		}

		pdf.save(`job-card-${jobCard.jobNumber || "report"}.pdf`);
		toast.success("PDF downloaded successfully!");
	} catch (error) {
		console.error("PDF generation error:", error);
		toast.error("Failed to generate PDF");
	}
};
