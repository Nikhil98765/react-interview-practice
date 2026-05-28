export const debounce = (fn, delay) => {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

const handleSearch = debounce((e) => {
  console.log('🚀 ~ handleSearch ~ e.target.value:', e.target.value);
}, 1000);

const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', handleSearch);
}

export const throttle = (fn, limit) => {
  let isThrottled = false;
  return function (...args) {
    if (isThrottled) return;
    isThrottled = true;
    fn.apply(this, args);
    setTimeout(() => {
      isThrottled = false;
    }, limit);
  };
};

const handleScroll = throttle(() => {
  console.log('🚀 ~ window.scrollY:', window.scrollY);
}, 1000);

const scrollContainer = document.getElementById('scroll-container');
scrollContainer.addEventListener('scroll', handleScroll);
