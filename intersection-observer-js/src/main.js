const cards = document.querySelectorAll(".card");
const cardContainer = document.querySelector('.card-container');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle("show", entry.isIntersecting);
  });
}, {
  threshold: 0
});

cards.forEach((card) => {
  observer.observe(card);
});

// Infinite scrolling
const lastCardObserver = new IntersectionObserver(entries => { 
  const lastCard = entries[0];
  if (!lastCard.isIntersecting) return;
  loadNewCards();
  lastCardObserver.unobserve(lastCard.target);
  lastCardObserver.observe(document.querySelector(".card:last-child"));
}, {
  rootMargin: '10px'
});

lastCardObserver.observe(document.querySelector('.card:last-child'));


function loadNewCards() {
  for (let i = 0; i < 10; i++) {
    const newCard = document.createElement('div');
    newCard.classList.add('card');
    newCard.textContent = 'New Card';
    cardContainer.appendChild(newCard);
    observer.observe(newCard);
  }
}
