const BLANK_URL = "https://raw.githubusercontent.com/umesh7499/Micro-Maker-Tool/main/blank.pdf";

// SUCCESS POPUP
function showSuccessPopup() {
    const popup = document.getElementById("successPopup");
    popup.style.display = "block";

    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });

    setTimeout(() => popup.style.display = "none", 3000);
}


// MAIN FUNCTION
async function reorganizePDF() {
    const pdfFile = document.getElementById("pdfFile").files[0];
    const mode = document.getElementById("modeSelect").value;

    if (!pdfFile) return alert("Please upload a PDF first.");

    const pdfBytes = await pdfFile.arrayBuffer();
    const blankBytes = await fetch(BLANK_URL).then(res => res.arrayBuffer());

    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const blankDoc = await PDFLib.PDFDocument.load(blankBytes);
    const newPdf = await PDFLib.PDFDocument.create();

    const totalPages = pdfDoc.getPageCount();


    // 6-PAGE PATTERN
    const pattern6 = [
        [1,3,5,7,9,11],
        [8,10,12,2,4,6],

        [13,15,17,19,21,23],
        [20,22,24,14,16,18],


[25,27,29,31,33,35],
        [32,34,36,26,28,30],

        [37,39,41,43,45,47],
        [44,46,48,38,40,42],

        [49,51,53,55,57,59],
        [56,58,60,50,52,54],




    ];

    // 9-PAGE PATTERN
    const pattern9 = [
        [1,3,5,7,9,11,13,15,17],
        [6,4,2,12,10,8,18,16,14],




[19,21,23,25,27,29,31,33,35],
        [24,22,20,30,28,26,36,34,32],

        [37,39,41,43,45,47,49,51,53],
        [42,40,38,48,46,44,54,52,50],

        [55,57,59,61,63,65,67,69,71],
        [60,58,56,66,64,62,72,70,68],

        [73,75,77,79,81,83,85,87,89],
        [78,76,74,84,82,80,90,88,86],

        [91,93,95,97,99,101,103,105,107],
        [96,94,92,102,100,98,108,106,104],

        [109,111,113,115,117,119,121,123,125],
        [114,112,110,120,118,116,126,124,122],

        [127,129,131,133,135,137,139,141,143],
        [132,130,128,138,136,134,144,142,140],

        [145,147,149,151,153,155,157,159,161],
        [150,148,146,156,154,152,162,160,158],



    ];

    let patternToUse = (mode === "6page") ? pattern6 : pattern9;

    for (let r = 0; r < patternToUse.length; r++) {
    const row = patternToUse[r];

    // ✅ STOP IF ENTIRE ROW HAS NO VALID PAGES
    const rowHasUsefulPages = row.some(p => p <= totalPages);
    if (!rowHasUsefulPages) break;

    const rotate = (mode === "6page" && r % 2 === 1);

    for (let p of row) {
        const index = p - 1;

        let finalPage;
        if (index < totalPages) {
            finalPage = (await newPdf.copyPages(pdfDoc, [index]))[0];
        } else {
            finalPage = (await newPdf.copyPages(blankDoc, [0]))[0];
        }

        if (rotate) finalPage.setRotation(PDFLib.degrees(180));

        newPdf.addPage(finalPage);
    }
}

    const originalName = pdfFile.name.replace(".pdf", "");
    const outputName = originalName + "_ORGANIZED.pdf";

    const dataUri = await newPdf.saveAsBase64({ dataUri: true });
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = outputName;
    link.click();

    showSuccessPopup();
}









document.addEventListener('contextmenu', function(e) {
    e.preventDefault();

    // Create message element
    let msg = document.createElement('div');
    msg.textContent = 'Accha Lavde !!!';
    msg.style.position = 'fixed';
    msg.style.top = e.clientY + 'px';
    msg.style.left = e.clientX + 'px';
    msg.style.backgroundColor = 'rgba(0,0,0,0.75)';
    msg.style.color = 'white';
    msg.style.padding = '4px 8px';
    msg.style.borderRadius = '4px';
    msg.style.fontSize = '12px';
    msg.style.pointerEvents = 'none';
    msg.style.zIndex = 9999;
    msg.style.userSelect = 'none';
    msg.style.transition = 'opacity 1s ease-out';
    msg.style.opacity = '1';

    document.body.appendChild(msg);

    // Fade out and remove after 1.5 seconds
    setTimeout(() => {
      msg.style.opacity = '0';
      setTimeout(() => {
        msg.remove();
      }, 1000);
    }, 1500);
  });




















async function reorganizePDF() {
    const fileInput = document.getElementById("pdfFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload a PDF first.");
        return;
    }

    // Show loading screen
    showLoading();

    try {
        // Read PDF bytes gradually
        const pdfBytes = await file.arrayBuffer();

        // Load PDF
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, { 
            updateMetadata: false,
            ignoreEncryption: true
        });

        const totalPages = pdfDoc.getPageCount();

        // Create new output PDF
        const newPDF = await PDFLib.PDFDocument.create();

        let batchSize = 10;   // process 10 pages at a time (prevents crashing)

        for (let i = 0; i < totalPages; i += batchSize) {

            await new Promise(resolve => setTimeout(resolve, 50)); // yield to prevent freeze

            const end = Math.min(i + batchSize, totalPages);
            const pagesToCopy = await newPDF.copyPages(pdfDoc, [...Array(end - i).keys()].map(x => x + i));

            pagesToCopy.forEach(p => newPDF.addPage(p));
        }

        // Export final PDF
        const finalPDF = await newPDF.save();

        // Download
        downloadPDF(finalPDF, "Reorganized.pdf");

        showSuccessPopup();

    } catch (err) {
        console.error(err);
        alert("Error while processing PDF. Try smaller batch size.");
    }

    hideLoading();
}

function downloadPDF(bytes, filename) {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Loading overlay 
function showLoading() {
    const loader = document.createElement("div");
    loader.id = "loaderOverlay";
    loader.innerHTML = `
        <div class="loader-spinner"></div>
        <p>Processing PDF... Please wait</p>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById("loaderOverlay");
    if (loader) loader.remove();
}
