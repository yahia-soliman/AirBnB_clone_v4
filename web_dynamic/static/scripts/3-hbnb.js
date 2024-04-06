const placeComponent = (place) => {
  return $(`<article>
    <div class="title_box"><h2>${place.name}</h2><div class="price_by_night">$${place.price_by_night}</div></div>
    <div class="information">
      <div class="max_guest">${place.max_guest}} Guest${place.max_guest != 1 && 's'}</div>
      <div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms != 1 && 's'}</div>
      <div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms != 1 && 's'}</div>
    </div>
    <div class="description">${place.description}</div>
  </article>`);
}

$(() => {
  const checkedAmenity = {};
  const amentiesH4 = $('.amenities h4');
  $.get('http://0.0.0.0:5001/api/v1/status/', function (_, _, jqXHR) {
    if (jqXHR.status === 200) {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  })

  $('.amenities input[type="checkbox"]').on('change', function () {
    if (this.checked) {
      checkedAmenity[this.dataset.id] = this.dataset.name;
    } else delete checkedAmenity[this.dataset.id];
    amentiesH4.text(Object.values(checkedAmenity).join(', '));
  });
  $.ajax({
    url: 'http://0.0.0.0:5001/api/v1/places_search',
    type: "POST",
    data: JSON.stringify({}),
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
