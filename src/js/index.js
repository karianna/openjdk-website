import { detectOS, loadLatestAssets, setRadioSelectors } from './common';

// set variables for all index page HTML elements that will be used by the JS
const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const dlText = document.getElementById('dl-text');
const dlLatest = document.getElementById('dl-latest');
const dlLatestText = document.getElementById('dl-latest-text');
const dlArchive = document.getElementById('dl-archive');
const dlOther = document.getElementById('dl-other');
const dlVersionText = document.getElementById('dl-version-text');

export function load() {
  setRadioSelectors();
  removeRadioButtons();

  // Try to match up the detected OS with a platform from 'config.json'
  const OS = detectOS();

  if (OS) {
    dlText.innerHTML = `Download for <var platform-name>${OS.officialName}</var>`;
  }
  dlText.classList.remove('invisible');

  const handleResponse = () => {
    buildHomepageHTML();
  };

  loadLatestAssets('variant', 'jvmVariant', 'latest', handleResponse, () => {
    errorContainer.innerHTML = `<p>There are no releases available for this variant on the JVM.
      Please check our <a href='nightly.html' target='blank'>Nightly Builds</a>.</p>`;
    loading.innerHTML = ''; // remove the loading dots
  });
}

function removeRadioButtons() {
  const buttons = document.getElementsByClassName('btn-label');
  for (let button of buttons) {
    if (button.firstChild.getAttribute('lts') === 'false') {
      button.style.display = 'none';
    }
  }
}

function buildHomepageHTML() {
  const version = 'variant'.replace(/\D/g, '');
  dlLatest.href = `https://adoptium.net/temurin/releases?version=${version}`;
  dlLatestText.textContent = 'adoptium.net';
  dlVersionText.innerHTML = 'AdoptOpenJDK has moved...';

  // remove the loading dots, and make all buttons visible, with animated fade-in
  loading.classList.add('hide');
  dlLatest.className = dlLatest.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');
  dlOther.className = dlOther.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');
  dlArchive.className = dlArchive.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');

  dlLatest.onclick = () => {
    document.getElementById('installation-link').className += ' animated pulse infinite transition-bright';
  };

  // animate the main download button shortly after the initial animation has finished.
  setTimeout(() => {
    dlLatest.className = 'dl-button a-button animated pulse';
  }, 1000);
}
