#!/usr/bin/python3
""" objects that handle all default RestFul API actions for Places """
from flasgger.utils import swag_from
from flask import abort, jsonify, make_response, request

from api.v1.views import app_views
from models import storage
from models.amenity import Amenity
from models.city import City
from models.place import Place
from models.state import State
from models.user import User


@app_views.route("/cities/<city_id>/places", methods=["GET"], strict_slashes=False)
@swag_from("documentation/place/get_places.yml", methods=["GET"])
def get_places(city_id):
    """
    Retrieves the list of all Place objects of a City
    """
    city = storage.get(City, city_id)

    if not city:
        abort(404)

    places = [place.to_dict() for place in city.places]

    return jsonify(places)


@app_views.route("/places/<place_id>", methods=["GET"], strict_slashes=False)
@swag_from("documentation/place/get_place.yml", methods=["GET"])
def get_place(place_id):
    """
    Retrieves a Place object
    """
    place = storage.get(Place, place_id)
    if not place:
        abort(404)

    return jsonify(place.to_dict())


@app_views.route("/places/<place_id>", methods=["DELETE"], strict_slashes=False)
@swag_from("documentation/place/delete_place.yml", methods=["DELETE"])
def delete_place(place_id):
    """
    Deletes a Place Object
    """

    place = storage.get(Place, place_id)

    if not place:
        abort(404)

    storage.delete(place)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route("/cities/<city_id>/places", methods=["POST"], strict_slashes=False)
@swag_from("documentation/place/post_place.yml", methods=["POST"])
def post_place(city_id):
    """
    Creates a Place
    """
    city = storage.get(City, city_id)

    if not city:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    if "user_id" not in request.get_json():
        abort(400, description="Missing user_id")

    data = request.get_json()
    user = storage.get(User, data["user_id"])

    if not user:
        abort(404)

    if "name" not in request.get_json():
        abort(400, description="Missing name")

    data["city_id"] = city_id
    instance = Place(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route("/places/<place_id>", methods=["PUT"], strict_slashes=False)
@swag_from("documentation/place/put_place.yml", methods=["PUT"])
def put_place(place_id):
    """
    Updates a Place
    """
    place = storage.get(Place, place_id)

    if not place:
        abort(404)

    data = request.get_json()
    if not data:
        abort(400, description="Not a JSON")

    ignore = ["id", "user_id", "city_id", "created_at", "updated_at"]

    for key, value in data.items():
        if key not in ignore:
            setattr(place, key, value)
    storage.save()
    return make_response(jsonify(place.to_dict()), 200)


@app_views.route("/places_search", methods=["POST"], strict_slashes=False)
@swag_from("documentation/place/post_search.yml", methods=["POST"])
def places_search():
    """
    Retrieves all Place objects depending of the JSON in the body
    of the request
    """
    data = request.get_json()
    if data is None:
        return abort(400, description="Not a JSON")
    state_ids = data.get("states", [])
    city_ids = data.get("cities", [])
    amenity_ids = data.get("amenities", [])

    if len(city_ids) + len(state_ids) == 0:
        filtered_places = storage.all(Place).values()
    else:
        filtered_places = []
        all_cities = storage.all(City)
        all_states = storage.all(State)
        for id in city_ids:
            city = all_cities.get("City." + id)
            if not city:
                continue
            if getattr(city, "state_id") in state_ids:
                state_ids.remove(city.state_id)
            filtered_places.extend(getattr(city, "places", []))

        for id in state_ids:
            state = all_states.get("State." + id)
            if not state:
                continue
            for city in getattr(state, "cities", []):
                filtered_places.extend(getattr(city, "places", []))

    if len(amenity_ids) == 0:
        places = [p.to_dict() for p in filtered_places]
    else:
        places = []
        amenity_ids = set(amenity_ids)
        for place in filtered_places:
            amenities = {a.id for a in place.amenities}
            if amenity_ids.issubset(amenities):
                place = place.to_dict()
                place.pop("amenities", 0)
                places.append(place)
    return jsonify(places)
