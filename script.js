const toggleBtn = document.getElementById('toggle-btn');
const bioBtn = document.getElementById('bio-btn');
const bioDetails = document.getElementById('bio-details');
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        toggleBtn.innerHTML = '&#9729;';
    } else {
        toggleBtn.innerHTML = '&#9728;';
    }
});

bioBtn.addEventListener('click', () => {
    bioDetails.style.display = bioDetails.style.display === 'none' ? 'block' : 'none';
    bioDetails.style.opacity = bioDetails.style.opacity === '0' ? '1' : '0';
});
