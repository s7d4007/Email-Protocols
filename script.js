// PDF Download functionality
document.addEventListener('DOMContentLoaded', function() {
    const downloadButton = document.getElementById('downloadPdf');
    
    if (downloadButton) {
        downloadButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const element = document.documentElement;
            const opt = {
                margin: 10,
                filename: 'Email-Protocols-Guide.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            };
            
            html2pdf().set(opt).from(element).save();
        });
    }
});
