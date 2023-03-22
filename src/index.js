import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const input = document.querySelector('input');

const perPage = 40;
const API_KEY = '34416358-69880e91706e8211d2d3c97df';
let currentPage = 1;

action();

function action() {
  hideLoadMoreButton();
  form.addEventListener('submit', onFormSubmit);
  loadMoreButton.addEventListener('click', onLoadMoreButtonClick);
}

function onLoadMoreButtonClick(event) {
  event.preventDefault();
  currentPage++;
  fetchImages(input.value.trim(), currentPage).then(scrollToNewImages);
}

async function onFormSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  gallery.innerHTML = '';

  const searchQuery = input.value.trim();
  if (!searchQuery) {
    hideLoadMoreButton();
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  fetchImages(searchQuery);
}

async function fetchImages(searchQuery, pageNumber) {
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${pageNumber}&per_page=${perPage}`;
  try {
    const response = await axios.get(url);
    createGalleryMarkup(response.data);
    notification(response.data.hits.length, response.data.total);
    return response.data;
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure(
      'Oops! Something went wrong. Please try again later.'
    );
  }
}

function createGalleryMarkup(images) {
  const markup = images.hits.map(createImageMarkup).join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

function createImageMarkup({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) {
  return `
    <a class="photo__link" href="${largeImageURL}">
      <div class="photo-card">
        <img class="gallery-item__img" src="${webformatURL}" data-source="${largeImageURL}" alt="${tags}" loading="lazy" data-caption="Likes: ${likes}<br>Views: ${views}<br>Comments: ${comments}<br>Downloads: ${downloads}"/>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${likes}</p>
          <p class="info-item"><b>Views:</b> ${views}</p>
          <p class="info-item"><b>Comments:</b> ${comments}</p>
          <p class="info-item"><b>Downloads:</b> ${downloads}</p>
        </div>
      </div>
    </a>
  `;
}

const lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'data-caption',
  captionDelay: 250,
  captionPosition: 'bottom',
  close: true,
  closeText: 'O',
  preload: true,
  spinner: true,
  enableKeyboard: true,
  spinnerHtml: null,
  widthRatio: 0.8,
  heightRatio: 0.8,
  scaleImageToRatio: false,
  disableRightClick: false,
});

function scrollToNewImages() {
  const newImages = gallery.querySelectorAll('.photo__link');
  const targetImage = newImages[newImages.length - perPage];
  if (targetImage) {
    targetImage.scrollIntoView({ behavior: 'smooth' });
  }
}

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

function notification(length, totalHits) {
  if (length === 0) {
    Notiflix.Notify.info(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  if (currentPage === 1) {
    showLoadMoreButton();
    Notiflix.Notify.success(`Hooray! ${totalHits} images found.`);
  }

  if (length < 40) {
    hideLoadMoreButton();
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}
