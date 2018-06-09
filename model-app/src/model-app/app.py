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
    time_in_transition = float(data['time_in_transit']) if data['time_in_transit'] else 15*60

    # TODO: function to run the graph model
    # get_paths()

    paths = [{'p1': {'lat': 47.37668200000147, 'lng': 8.548887999999996},
              'p2': {'lat': 47.41152900000283, 'lng': 8.544114999999866},
              'probability': 0.9},
             {'p1': {'lat': 47.37668200000147, 'lng': 8.548887999999996},
              'p2': {'lat': 47.360155000001676, 'lng': 8.568626000000208},
              'probability': 0.7},
             {'p1': {'lat': 47.360155000001676, 'lng': 8.568626000000208},
              'p2': {'lat': 47.34539200000099, 'lng': 8.59330000000028},
              'probability': 0.6},
             {'p1': {'lat': 47.360155000001676, 'lng': 8.568626000000208},
              'p2': {'lat': 47.34539200000099, 'lng': 8.59330000000028},
              'probability': 0.95},
             {'p1': {'lat': 47.34539200000099, 'lng': 8.59330000000028},
              'p2': {'lat': 47.33679599999966, 'lng': 8.61702599999992},
              'probability': 0.4},
             {'p1': {'lat': 47.37668200000147, 'lng': 8.548887999999996},
              'p2': {'lat': 47.3930319999998, 'lng': 8.52935900000011},
              'probability': 1},
             {'p1': {'lat': 47.3930319999998, 'lng': 8.52935900000011},
              'p2': {'lat': 47.40200900000773, 'lng': 8.4993749999995},
              'probability': 0.8},
             {'p1': {'lat': 47.40200900000773, 'lng': 8.4993749999995},
              'p2': {'lat': 47.39148099999886, 'lng': 8.488940000000103},
              'probability': 0.2},
             {'p1': {'lat': 47.41152900000283, 'lng': 8.544114999999866},
              'p2': {'lat': 47.42995200000376, 'lng': 8.561768999999916},
              'probability': 0.7},
             {'p1': {'lat': 47.41152900000283, 'lng': 8.544114999999866},
              'p2': {'lat': 47.4187469999972, 'lng': 8.544635999999347},
              'probability': 0.4},
             {'p1': {'lat': 47.41152900000283, 'lng': 8.544114999999866},
              'p2': {'lat': 47.420913000002166, 'lng': 8.508564999999567},
              'probability': 0.3}
             ]

    stations = [['Zürich, ETH/Universitätsspital',
                 {'lat': 47.37668200000147, 'lng': 8.548887999999996}],
                ['Zürich Oerlikon', {'lat': 47.41152900000283, 'lng': 8.544114999999866}],
                ['Waldburg, Station', {'lat': 47.34539200000099, 'lng': 8.59330000000028}],
                ['Waltikon', {'lat': 47.33679599999966, 'lng': 8.61702599999992}],
                ['Zürich Affoltern,', {'lat': 47.420913000002166, 'lng': 8.508564999999567}],
                ['Zürich Seebach', {'lat': 47.4187469999972, 'lng': 8.544635999999347}],
                ['Opfikon', {'lat': 47.42995200000376, 'lng': 8.561768999999916}],
                ['Zürich Wipkingen', {'lat': 47.3930319999998, 'lng': 8.52935900000011}],
                ['Meierhofplatz', {'lat': 47.40200900000773, 'lng': 8.4993749999995}],
                ['Zürich Altstetten', {'lat': 47.39148099999886, 'lng': 8.488940000000103}]
               ]
    output = {'paths': paths, 'stations': stations}

    return jsonify(output), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
