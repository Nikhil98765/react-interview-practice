
export const debounce = (fn, delay) => {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }
}

const handleSearch = debounce((e) => {
  console.log("🚀 ~ handleSearch ~ e.target.value:", e.target.value);
}, 1000);

document.getElementById('searchInput').addEventListener('input', handleSearch);

