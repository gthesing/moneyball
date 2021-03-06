import os
import numpy as np
import pandas as pd
import sqlalchemy
import pymysql
import pickle
pymysql.install_as_MySQLdb()

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from sqlalchemy import extract

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

app = Flask(__name__)

# establish connection
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get('DATABASE_URL','')  or "sqlite:///baseball.sqlite"
engine = create_engine("sqlite:///baseball.sqlite")
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
Baseball_Data = Base.classes.baseball
session = Session(engine)

prediction= []
x= []


def ValuePredictor(form_data):
    to_predict = np.array(form_data).reshape(1,6)
    with open("playoffs_logistic_regression_trained.pkl", 'rb') as file:  
        pickle_model = pickle.load(file)   
    result = pickle_model.predict(to_predict)
    
    if int(result)==1:
        prediction= "Your Team is Likely to Make the Playoffs!"
    elif int(result)==0:
        prediction='Not this Year!'
    else:
        prediction='Enter the data below'
    print(result)
    return (prediction)


@app.route("/", methods=['POST', 'GET'])
def send():
    x= " "
    form_data = []
    if request.method == "POST":
        RS = request.form["RS"]
        RA = request.form["RA"]
        W = request.form["W"]
        BA = request.form["BA"]
        OBP = request.form["OBP"]
        SLG = request.form["SLG"]

        form_data = [int(RS),int(RA),int(W),float(BA),float(OBP),float(SLG)]
        print (form_data)
        x = ValuePredictor(form_data)
    return render_template('index.html', variable = x)  

@app.route("/radar")
def radar():
    return render_template("radar.html")

@app.route("/model")
def model():
    return render_template("model.html")

@app.route("/statsprogression")
def statsprogression():
    return render_template("statsprogression.html")    

@app.route("/playoff_average")
def playoffs():
    #Averages for playoff teams by year
    results = db.session.query(Baseball_Data.Year,func.avg(Baseball_Data.RS),func.avg(Baseball_Data.RA),\
    func.avg(Baseball_Data.W),func.avg(Baseball_Data.OBP),func.avg(Baseball_Data.SLG),func.avg(Baseball_Data.BA)).\
    group_by(Baseball_Data.Year).filter(Baseball_Data.Playoffs == 1).all()

    baseball_data = []
    for result in results:
        baseball_dict = {}
        baseball_dict["Year"] = result[0]
        baseball_dict["RS"] = result[1]
        baseball_dict["RA"] = result[2]
        baseball_dict["W"] = result[3]
        baseball_dict["OBP"] = result[4]
        baseball_dict["SLG"] = result[5]
        baseball_dict["BA"] = result[6]
        baseball_data.append(baseball_dict)

    return jsonify(baseball_data)

@app.route("/all_stats_hist")
def histdata():
    results = db.session.query(Baseball_Data.RS,Baseball_Data.RA,Baseball_Data.W,Baseball_Data.OBP,\
        Baseball_Data.SLG,Baseball_Data.BA).all()

    baseball_data = []
    RS = []
    RA = []
    W = [] 
    OBP = []
    SLG = []
    BA = []

    for result in results:
        RS.append(result[0])
        RA.append(result[1])
        W.append(result[2])
        OBP.append(result[3])
        SLG.append(result[4])
        BA.append(result[5])

    baseball_dict = {'RS': RS, 'RA': RA, 'W': W, 'OBP': OBP, 'SLG': SLG, 'BA': BA}
    baseball_data.append(baseball_dict)

    return jsonify(baseball_data)

@app.route("/alltime_playoff")
def alltime():
    #All time Averages for a playoff making team
    results = db.session.query(func.avg(Baseball_Data.RS),func.avg(Baseball_Data.RA),\
    func.avg(Baseball_Data.W),func.avg(Baseball_Data.OBP),func.avg(Baseball_Data.SLG),func.avg(Baseball_Data.BA)).filter(Baseball_Data.Playoffs == 1).all()

    baseball_data = []
    for result in results:
        baseball_dict = {}
        baseball_dict["RS"] = result[0]
        baseball_dict["RA"] = result[1]
        baseball_dict["W"] = result[2]
        baseball_dict["OBP"] = result[3]
        baseball_dict["SLG"] = result[4]
        baseball_dict["BA"] = result[5]
        baseball_data.append(baseball_dict)

    return jsonify(baseball_data)

@app.route("/alltime_max")
def max_vals():
    results = db.session.query(func.max(Baseball_Data.RS),func.max(Baseball_Data.RA),\
        func.max(Baseball_Data.W),func.max(Baseball_Data.OBP),func.max(Baseball_Data.SLG),\
            func.max(Baseball_Data.BA)).all()

    baseball_data = []
    for result in results:
        baseball_dict = {}
        baseball_dict["RS"] = result[0]
        baseball_dict["RA"] = result[1]
        baseball_dict["W"] = result[2]
        baseball_dict["OBP"] = result[3]
        baseball_dict["SLG"] = result[4]
        baseball_dict["BA"] = result[5]
        baseball_data.append(baseball_dict)

    return jsonify(baseball_data)

@app.route("/<team>")
def team(team):
    #Historical data on given team
    results = db.session.query(Baseball_Data.Year,Baseball_Data.W,Baseball_Data.Playoffs,\
    Baseball_Data.RankPlayoffs,Baseball_Data.Team).filter(Baseball_Data.Team == team).all()

    baseball_data = []
    for result in results:
        baseball_dict = {}
        baseball_dict["Year"] = result[0]
        baseball_dict["Wins"] = result[1]
        baseball_dict["Playoffs"] = result[2]
        baseball_dict["Playoff_Result"] = result[3]
        baseball_dict["Team"] = result[4]
        baseball_data.append(baseball_dict)
    
    return jsonify(baseball_data)

@app.route("/playoffs")
def playoff_count():
    #Historical playoff appearances by team
    results = db.session.query(Baseball_Data.Team,func.sum(Baseball_Data.Playoffs)).\
    group_by(Baseball_Data.Team).all()

    baseball_data = []
    for result in results:
        if result[1] != 0:
            baseball_dict = {}
            baseball_dict["Team"] = result[0]
            baseball_dict["Playoff_Appearances"] = result[1]
            baseball_data.append(baseball_dict)
        else:
            continue

    return jsonify(baseball_data)

# @app.route("/worldseries")
# def worldseries():
#     results = db.session.query(Baseball_Data.Team,func.sum(Baseball_Data.RankPlayoffs)).\
#     filter(Baseball_Data.RankPlayoffs == 1).group_by(Baseball_Data.Team).all()

#     baseball_data = []
#     for result in results:
#         baseball_dict = {}
#         baseball_dict["Team"] = result[0]
#         baseball_dict["WorldSeries_Wins"] = result[1]
#         baseball_data.append(baseball_dict)

#     return jsonify(baseball_data)


@app.route("/stats/<stat>")
def stats(stat):

    #Yearly average for given stat for playoff making team
    results = db.session.query(Baseball_Data.Year,func.avg(Baseball_Data.RS),func.avg(Baseball_Data.RA),\
    func.avg(Baseball_Data.W),func.avg(Baseball_Data.OBP),func.avg(Baseball_Data.SLG),func.avg(Baseball_Data.BA)).\
    group_by(Baseball_Data.Year).filter(Baseball_Data.Playoffs == 1)

    baseball_data = []
    for result in results:
        baseball_dict = {}
        baseball_dict["Year"] = result[0]
        baseball_dict["Stat"] = stat
        if stat == "RS":
            baseball_dict["Average"] = result[1]
        elif stat == "RA":
            baseball_dict["Average"] = result[2]
        elif stat == "W":
            baseball_dict["Average"] = result[3]
        elif stat == "OBP":
            baseball_dict["Average"] = result[4]
        elif stat == "SLG":
            baseball_dict["Average"] = result[5]
        elif stat == "BA":
            baseball_dict["Average"] = result[6]
        else:
            baseball_dict["ERROR"] = "No stat of this type"

        baseball_data.append(baseball_dict)
    return jsonify(baseball_data)


if __name__ == "__main__":
    app.run()

                                    
