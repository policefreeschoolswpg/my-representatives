photoUrlCurls = [];

output = await Array.from(document.querySelectorAll('.calendar_wrap tbody tr a')).map(e => e.href).reduce(async (mlasP, url) => {
  const mlas = await mlasP;

  const response = await fetch(url);
  const text = await response.text();
  const doc = (new DOMParser()).parseFromString(text, 'text/html');

  const mla = {};
  mlas.push(mla);

  if (doc.querySelectorAll('h2').length == 1) {
    [mla.name, mla.division] = doc.querySelector('.members h2').innerText.split('\n')
        .map(s => s.trim().replace(/ +/g, ' '));
  } else {
    [mla.name, mla.division] =
      Array.from(doc.querySelectorAll('h2'))
        .map(e => e.innerText.trim().replace(/ +/g, ' '));
  }

  mla.name = mla.name.replace('Hon. ', ''); // lol fuck off

  [mla.email, mla.constituencyEmail] = Array.from(doc.querySelectorAll('.members a[href*=mailto]'))
    .map(e => e.innerText.trim())
    .filter(s => s);

  [mla.phone, mla.constituencyPhone] = Array.from(doc.querySelectorAll('.members p'))
    .map(e => e.innerText)
    .join(' ')
    .match(/Phone: +\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})/g)
    .map(s => s.replace('Phone: ', ''));

  const photoEl = doc.querySelector('img.page_graphic');
  photoUrlCurls.push(`curl -O ${photoEl.src.replace('ca/img', 'ca/legislature/img')}`);

  const srcSegments = photoEl.src.split('/');
  mla.photo = srcSegments[srcSegments.length - 1];

  return Promise.resolve(mlas);
}, Promise.resolve([]))

asJson = JSON.stringify(output, null, 2);

console.log(asJson);
