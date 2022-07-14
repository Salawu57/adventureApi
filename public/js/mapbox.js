export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZmlzY281NyIsImEiOiJjbDU4bzRkODAwcnBxM21xbnloOHZ5MTB2In0.XMbWukOhRvaVrVbJd63MSQ";
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/fisco57/cl58ub32m00ei14ogfeznh0hx",
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //CREATE MARKER
    const el = document.createElement("div");
    el.className = "marker";

    //ADD MARKER
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //ADD POPUP
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
