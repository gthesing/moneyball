import os
import numpy as np
import pandas as pd
import sqlalchemy
import pymysql
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

@app.route("/")
def home():
    return "Hello World"

@app.route("/playoff_average")
def playoffs():
    #Averages for playoff teams
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

@app.route("/<team>")
def team(team):
    results = db.session.query(Baseball_Data.Year,Baseball_Data.W,Baseball_Data.Playoffs,\
    Baseball_Data.RankPlayoffs,Baseball_Data.Team).filter(Baseball_Data.Team == team)

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
    results = db.session.query(Baseball_Data.Team,func.sum(Baseball_Data.Playoffs)).\
    group_by(Baseball_Data.Team)

    baseball_data = []
    for result in results:
        baseball_dict = {}
        baseball_dict["Team"] = result[0]
        baseball_dict["Playoff_Appearances"] = result[1]
        baseball_data.append(baseball_dict)

    return jsonify(baseball_data)

@app.route("/stats/<stat>")
def stats(stat):
    test = f"Baseball_Data.{stat}"
    results = db.session.query(Baseball_Data.Year,func.avg(test)).\
    group_by(Baseball_Data.Year).filter(Baseball_Data.Playoffs == 1)

    baseball_data = []
    for result in results:
        baseball_dict = {}
        baseball_dict["Year"] = result[0]
        baseball_dict[f"Average_{stat}"] = result[1]
        baseball_data.append(baseball_dict)
    # return test
    return jsonify(baseball_data)


if __name__ == "__main__":
    app.run()

                                    