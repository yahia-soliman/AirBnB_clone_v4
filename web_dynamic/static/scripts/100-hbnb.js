const placeComponent = (place) => {
  return $(`<article>
    <div class="title_box"><h2>${place.name}</h2><div class="price_by_night">$${place.price_by_night}</div></div>
    <div class="information">
      <div class="max_guest">${place.max_guest} Guest${place.max_guest != 1 && 's' || ''}</div>
      <div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms != 1 && 's' || ''}</div>
      <div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms != 1 && 's' || ''}</div>
    </div>
    <div class="description">${place.description}</div>
  </article>`);
}

$(() => {
  const amentiesH4 = $('.amenities h4');
  const statesH4 = $('.states h4');

  const amenities = {};
  const states = {};
  const cities = {};
  const checked = {
    states: [],
    cities: [],
    amenities: [],
  }

  $.get('http://0.0.0.0:5001/api/v1/status/', function (_, _, jqXHR) {
    if (jqXHR.status === 200) {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  })

  $('.filters input[name="states"]').on('change', function () {
    if (!this.checked) delete states[this.dataset.id];
    else states[this.dataset.id] = this.dataset.name;
    checked.states = Object.keys(states);
    statesH4.text(Object.values(states).join(', '));
  });
  $('.filters input[name="cities"]').on('change', function () {
    if (!this.checked) delete cities[this.dataset.id];
    else cities[this.dataset.id] = this.dataset.name;
    checked.cities = Object.keys(cities);
  });
  $('.filters input[name="amenities"]').on('change', function () {
    if (!this.checked) delete amenities[this.dataset.id];
    else amenities[this.dataset.id] = this.dataset.name;
    checked.amenities = Object.keys(amenities);
    amentiesH4.text(Object.values(amenities).join(', '));
  });

  $('.filters button').on('click', () => {
    console.log(checked);
    $.ajax({
      url: 'http://0.0.0.0:5001/api/v1/places_search',
      type: "POST",
      data: JSON.stringify(checked),
      dataType: "json",
      contentType: "application/json",
      success: function (data) {
        const places = $('.places');
        places.html('')
        for (const place of data) {
          places.append(placeComponent(place));
        }
      }
    });
  });
});
