#!/usr/bin/env python
from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route('/paths', methods=['POST'])
def get_paths():
    data = request.json
    temperature = float(data['temperature']) if data['temperature'] else 18.5
    humidity = float(data['humidity']) if data['humidity'] else 0.5
    weekday = data['weekday'] if data['weekday'] else 'Monday'
    departure_station_id = int(data['station_id'])
    probability = float(data['probability']) if data['probability'] else .5
    # time_in_transition = FILLIT

    # TODO: function to run the graph model
    # get_paths()

    paths = [{'p1': {'lat': 47.377240999997895, 'lng': 8.53933799999979},
              'p2': {'lat': 47.37306600000011, 'lng': 8.538457000000037},
              'probability': 0.96},
             {'p1': {'lat': 47.37817699999911, 'lng': 8.540192000000241},
              'p2': {'lat': 47.377240999997895, 'lng': 8.53933799999979},
              'probability': 0.96},
             {'p1': {'lat': 47.37306600000011, 'lng': 8.538457000000037},
              'p2': {'lat': 47.36936599999938, 'lng': 8.538764999999914},
              'probability': 0.91},
             {'p1': {'lat': 47.37306600000011, 'lng': 8.538457000000037},
              'p2': {'lat': 47.37306600000011, 'lng': 8.538457000000037},
              'probability': 0.91},
             {'p1': {'lat': 47.36936599999938, 'lng': 8.538764999999914},
              'p2': {'lat': 47.366823999998005, 'lng': 8.540340999999904},
              'probability': 0.82},
             {'p1': {'lat': 47.36936599999938, 'lng': 8.538764999999914},
              'p2': {'lat': 47.36936599999938, 'lng': 8.538764999999914},
              'probability': 0.82},
             {'p1': {'lat': 47.377240999997895, 'lng': 8.53933799999979},
              'p2': {'lat': 47.376845999999254, 'lng': 8.543937999999894},
              'probability': 0.79},
             {'p1': {'lat': 47.37817699999911, 'lng': 8.540192000000241},
              'p2': {'lat': 47.377240999997895, 'lng': 8.53933799999979},
              'probability': 0.79}]

    stations = [['Zürich, Bahnhofplatz/HB',
                 {'lat': 47.377240999997895, 'lng': 8.53933799999979}],
                ['Zürich, Rennweg', {'lat': 47.37306600000011, 'lng': 8.538457000000037}],
                ['Zürich HB', {'lat': 47.37817699999911, 'lng': 8.540192000000241}],
                ['Zürich, Paradeplatz', {'lat': 47.36936599999938, 'lng': 8.538764999999914}],
                ['Zürich, Bürkliplatz',
                 {'lat': 47.366823999998005, 'lng': 8.540340999999904}],
                ['Zürich, Central', {'lat': 47.376845999999254, 'lng': 8.543937999999894}]]

    output = {'paths': paths, 'stations': stations}

    return jsonify(output), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
