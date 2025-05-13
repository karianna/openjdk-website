import { detectLTS, detectEA, findPlatform, getOfficialName, getPlatformOrder, loadAssetInfo, setRadioSelectors, setTickLink, variant, jvmVariant } from './common';
import moment from 'moment';
import Handlebars from 'handlebars';
import $ from 'jquery';

const loading = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const global = window;

export function load() {
  setRadioSelectors();
  setTickLink();

  loadAssetInfo(variant, jvmVariant, 'upstream', undefined, undefined, undefined, 'adoptopenjdk', buildUpstreamHTML, () => {
    loading.innerHTML = '';
    errorContainer.innerHTML = `<p>There are no upstream builds yet for ${variant} on the ${jvmVariant} JVM.
      See the <a href='./nightly.html?variant=${variant}&jvmVariant=${jvmVariant}'>Nightly builds</a> page.</p>`;
  });
}

function buildUpstreamHTML(aReleases) {
  const releases = [];

  aReleases.forEach(aRelease => {
    const publishedAt = moment(aRelease.timestamp);

    const release = {
      release_name: aRelease.release_name,
      release_link: aRelease.release_link,
      release_day: publishedAt.format('D'),
      release_month: publishedAt.format('MMMM'),
      release_year: publishedAt.format('YYYY'),
      early_access: detectEA(aRelease.version_data),
      lts: detectLTS(aRelease.version_data.semver),
      platforms: {},
    };

    aRelease.binaries.forEach(aReleaseAsset => {
      const platform = findPlatform(aReleaseAsset);

      if (!platform) {
        return;
      }

      const binary_type = aReleaseAsset.image_type.toUpperCase();
      if (!['INSTALLER', 'JDK', 'JRE'].includes(binary_type)) {
        return;
      }

      if (!release.platforms[platform]) {
        release.platforms[platform] = {
          official_name: getOfficialName(platform),
          ordinal: getPlatformOrder(platform),
          assets: [],
        };
      }

      const binary_constructor = {
        type: binary_type,
        link: aReleaseAsset.package.link,
        checksum: aReleaseAsset.package.checksum,
        size: Math.floor(aReleaseAsset.package.size / 1000 / 1000),
      };

      if (aReleaseAsset.installer) {
        binary_constructor.installer_link = aReleaseAsset.installer.link;
        binary_constructor.installer_checksum = aReleaseAsset.installer.checksum;
        binary_constructor.installer_size = Math.floor(aReleaseAsset.installer.size / 1000 / 1000);
      }

      release.platforms[platform].assets.push(binary_constructor);
    });

    releases.push(release);
  });

  const template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('upstream-table-body').innerHTML = template({ releases });

  setPagination();

  loading.innerHTML = '';

  const upstreamList = document.getElementById('upstream-list');
  upstreamList.className = upstreamList.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
}

function setPagination() {
  const container = document.getElementById('pagination-container');
  const upstreamTableBody = document.getElementById('upstream-table-body');

  $(container).pagination({
    dataSource: Array.from(upstreamTableBody.getElementsByClassName('release-row')).map((row) => row.outerHTML),
    pageSize: 5,
    callback: (rows) => { upstreamTableBody.innerHTML = rows.join(''); },
  });

  if (container.getElementsByTagName('li').length <= 3) {
    container.classList.add('hide');
  }
}

global.renderChecksum = function (checksum) {
  const modal = document.getElementById('myModal');
  document.getElementById('modal-body').innerHTML = checksum;
  modal.style.display = 'inline';
};

global.hideChecksum = function () {
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';
};
