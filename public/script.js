
function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) return alert('Please upload a file.');

  const formData = new FormData();
  formData.append('file', file);

  fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData,
  })
    .then(response => response.blob())
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'Product-Check-Results.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();

      alert('✅ Download complete!');
    })
    .catch(err => console.error(err));
}
