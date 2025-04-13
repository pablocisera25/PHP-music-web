document.querySelectorAll('.save-form-player').forEach(form => {
    form.addEventListener('submit', async e => {
        e.preventDefault(); // Evita que recargue la página

        const formData = new FormData(form);

        const response = await fetch('/controllers/save_music.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert('Canción guardada 🎵');
        } else {
            alert(`Error al guardar: ${result.message}`);
        }
    });
});
