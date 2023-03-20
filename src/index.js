import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const perPage = 40;
const API_KEY = `34416358-69880e91706e8211d2d3c97df`;
let currentPage = 1;
let currentQuery = '';

hideLoadMoreButton();

form.addEventListener('submit', onFormSubmit);
loadMoreButton.addEventListener('click', onLoadMoreButtonClick);

async function onFormSubmit(event) {
  event.preventDefault();
  const searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    return;
  }

  currentQuery = searchQuery;
  currentPage = 1;
  gallery.innerHTML = '';
  fetchImages(currentQuery, currentPage);
}

async function fetchImages(searchQuery, pageNumber) {
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${pageNumber}&per_page=${perPage}`;

  try {
    const response = await axios.get(url);
    const images = response.data.hits;
    

    if (images.length === 0) {
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.',
      );
      return;
      }
      
      gallery.insertAdjacentHTML('beforeend', createGalleryMarkup(images));
lightbox.refresh();
    Notiflix.Notify.success(`Hooray! ${response.data.totalHits} images found.`);
    currentPage += 1;

    if (currentPage > 2) {
      window.scrollTo({
        top: document.documentElement.offsetHeight,
        behavior: 'smooth',
      });
    }

    if (currentPage <= response.data.totalHits/perPage && currentPage <= 12) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
    }
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure(
      'Oops! Something went wrong. Please try again later.',
    );
  }
}

function createGalleryMarkup(images) {
  return images
    .map(
      ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
        `
        <a href="${largeImageURL}">
        <div class="photo-card">
          <img src="${webformatURL}" data-source="${largeImageURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item">
              <b>Likes:</b> ${likes}
            </p>
            <p class="info-item">
              <b>Views:</b> ${views}
            </p>
            <p class="info-item">
              <b>Comments:</b> ${comments}
            </p>
            <p class="info-item">
              <b>Downloads:</b> ${downloads}
            </p>
          </div>
        </div>
        </a>
      `,
    )
    .join('');
}

gallery.addEventListener('click', onGalleryClick);

function onGalleryClick(event) {
  if (event.target.nodeName !== 'IMG') {
    return;
  }

  const largeImageURL = event.target.dataset.source;

  Notiflix.Modal.image(largeImageURL);
}

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

function onLoadMoreButtonClick(event) {
  event.preventDefault();
  fetchImages(currentQuery, currentPage);
}

const lightbox = new SimpleLightbox('.gallery a', {
captions: true,
captionsData: 'alt',
captionDelay: 250,
close: true,
closeText: 'O',
controls: true,
docClose: true,
preload: true,
spinner: true,
spinnerHtml: null,
widthRatio: 0.8,
heightRatio: 0.8,
scaleImageToRatio: false,
disableRightClick: false,
});