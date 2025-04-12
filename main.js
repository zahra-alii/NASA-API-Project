const date = document.querySelector('#date');
const photo = document.querySelector('#nasa-img');
const title = document.querySelector('#title');
const explanation = document.querySelector('#explanation');
const video = document.querySelector('#nasa-video'); // Updated
const birthdayBtn = document.querySelector('#birthdayBtn');
const birthdayDate = document.querySelector('#birthday-date');
const getPictureBtn = document.querySelector('#getPictureBtn');

// Gallery and carousel setup
const carouselContainer = document.querySelector('#carousel-container');
const backBtn = document.querySelector('#backBtn');
const nextBtn = document.querySelector('#nextBtn');
let carouselItems = []; 
let currentIndex = 0;


// Function to update carousel (show 4 on pg)
function updateCarousel() {
    const itemWidth = carouselItems[0].offsetWidth; // get width of 1 carousel item
    carouselContainer.style.transform = `translateX(-${itemWidth * currentIndex}px)`; 
}

// Next and Back carousel functions
function nextSlide() {
    const maxIndex = carouselItems.length - 4; // calc max index for each img
    if (currentIndex < maxIndex){
        currentIndex++;
    }else{
        currentIndex = 0; // go back to the start
    }
    updateCarousel();
}

function backSlide() {
    const maxIndex = carouselItems.length - 4;
    if(currentIndex > 0){
        currentIndex--;
    }else{
        currentIndex = maxIndex; // loop to end
    }
    updateCarousel();
}

// Event listeners for carousel navigation
nextBtn.addEventListener('click', nextSlide);
backBtn.addEventListener('click', backSlide);

// Display images/videos in the carousel
function displayCarouselImages(data) {
    carouselContainer.innerHTML = ''; // Clear carousel container

    data = data.filter(item => item !== null); // remove null inputs by default

    data.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('carousel-item');
        itemDiv.index = index;

        if (item.media_type === 'image') {
            const img = document.createElement('img');
            img.src = item.hdurl;
            img.alt = item.title;
            itemDiv.appendChild(img);

            // create div for date
            const dateDiv = document.createElement('div');
            dateDiv.classList.add('image-date');
            dateDiv.textContent = item.date; // date from API
            itemDiv.appendChild(dateDiv);

        } else if (item.media_type === 'video') {
            const iframe = document.createElement('iframe');
            iframe.src = item.url;
            iframe.frameBorder = '0';
            iframe.style.width = '100%';
            iframe.style.height = '315px';
            itemDiv.appendChild(iframe);


        }
        
        carouselContainer.appendChild(itemDiv);
    });

    carouselItems = Array.from(carouselContainer.children); 
    updateCarousel();
}

// func for multiple dates/imgs
function getDatesAroundBirthday(birthday, range = 3) {
    const dates = [];
    const birthdayDate = new Date(birthday);

    for (let i = -range; i <= range; i++) {
        const newDate = new Date(birthdayDate);
        newDate.setDate(birthdayDate.getDate() + i);
        const formattedDate = newDate.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
        dates.push(formattedDate);
    }

    return dates;
}

// Birthday mode functionality
function getImgByBirthday(birthday) {
    const dates = getDatesAroundBirthday(birthday);

    // Clear the carousel first
    carouselContainer.innerHTML = '';

    // Fetch images/videos for each date
    Promise.all(dates.map(date => fetchImageForDate(date)))
        .then(images => {
            displayCarouselImages(images); // Display all fetched images/videos in the carousel
        })
        .catch(err => console.log(`Error: ${err}`));
}

// Function to fetch image/video for a specific date
function fetchImageForDate(date) {
    const url = `https://api.nasa.gov/planetary/apod?api_key=6tytoSRb4VrcZpy4NG4ozbcAG4CBDHitEQaziCDq&date=${date}`;

    return fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data || !data.title || (!data.hdurl && !data.url)) {
                console.log('Invalid data received for date: ' + date);
                return null;
            }

            return data; // Return the image/video data
        })
        .catch(err => console.log(`Error fetching data for date ${date}: ${err}`));
}


// Event listener for birthday button
birthdayBtn.addEventListener('click', () => {
    const birthday = birthdayDate.value;
    if (!birthday) {
        alert('Please enter your birthday.');
        return;
    }

    // confetti feature
    birthdayBtn.classList.add('shake');
    setTimeout(() => birthdayBtn.classList.remove('shake'), 500);

    triggerConfetti();

    getImgByBirthday(birthday);
});



// confetti feature
const jsConfetti = new JSConfetti();

// Function to trigger confetti
function triggerConfetti() {
    jsConfetti.addConfetti({
        confettiRadius: 6,
        confettiNumber: 100,
        emojis: ['🌈', '🎊', '🎁', '✨', '💫', '🎉'],
        confettiPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    });
}
