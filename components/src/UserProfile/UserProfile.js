import React from "react";
import "./UserProfile.css";
import { connect } from "react-redux";
import { Button } from "react-bootstrap";
import Profile from "../Profile/Profile";

let years = [];
for (let i = 1950; i < 2022; i++) {
  years.push(i);
}

class UserProfile extends React.Component {
  state = {
    user: {},
    player: {},
    duelStatus: false,
    duelMessage: "",
    accepted: false,
    myDuel: false,
    duelID: null,
    resultStatus: true,
  };

  getUser = async () => {
    console.log("get", this.props.match.params.id)
    const response = await fetch(`http://localhost:3001/user/${this.props.match.params.id}`)
    const userData = await response.json();
    console.log("USERI DATAN", userData);
    fetch(`http://localhost:3001/player/${this.props.match.params.id}`)
      .then((response) => response.json())
      .then((data) => {
        const playerData = {
          wins: data.player.wins,
          points: data.player.points,
          games: data.player.games.length,
          rank: data.player.rank,
        };
        this.setState({ user: userData, player: playerData }, () =>
          this.getPlayerAndDuelStatus()
        );
      });
  };

  getPlayerAndDuelStatus = async () => {
    let duelId = null;
    const response = await fetch(
      `http://localhost:3001/player/${this.props.match.params.id}`
    );
    const data = await response.json();
    const thisDuel = data.duels.find((duel) => {
      if (
        duel.id1 === +this.props.profileData.id &&
        duel.id2 === +this.props.match.params.id
      ) {
        return duel;
      }
    });
    if (thisDuel) {
      duelId = thisDuel.id;
      this.setState({
        myDuel: true,
        duelMessage: thisDuel.status1,
        accepted: thisDuel.accepted,
        duelID: duelId,
      });
    } else {
      const myDuel = data.duels.find((duel) => {
        if (
          duel.id1 === +this.props.match.params.id &&
          duel.id2 === +this.props.profileData.id
        ) {
          return duel;
        }
      });
      if (myDuel) {
        duelId = myDuel.id;
        this.setState({
          myDuel: false,
          accepted: myDuel.accepted,
          duelMessage: myDuel.status2,
          duelID: duelId,
        });
      }
    }
    if (duelId == null) {
      this.setState({ duelID: null });
    }
  };

  componentDidMount() {
    this.getUser();
  }

  duelHandler = async () => {
    try {
      const id1 = +this.props.profileData.id;
      const id2 = +this.props.match.params.id;
      const duel = {
        id1: id1,
        id2: id2,
        accepted: false,
        status1: "???????????????? ???????????? ???? ????????????????????",
        status2: "?????? ?????????????? ??????????!",
        winner: "no winner",
        completed: false,
      };
      await fetch("http://localhost:3001/duels", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(duel),
      });
    } catch (err) {
      console.log(err);
    }
    this.getPlayerAndDuelStatus();
  };

  ignoreHandler = () => {
    const ignore = {
      completed: true,
    };
    fetch(`http://localhost:3001/ignore/duel/${this.state.duelID}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(ignore),
    }).then(() => this.getPlayerAndDuelStatus());
  };

  acceptHandler = () => {
    const accept = {
      accepted: true,
    };
    fetch(`http://localhost:3001/duel/${this.state.duelID}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(accept),
    }).then(() => this.getPlayerAndDuelStatus());
  };

  WinOrLoseHandler = (result) => {
    let results = {};
    if (result == "win") {
      results = {
        id1: +this.props.match.params.id,
        id2: +this.props.profileData.id,
        completed: true,
        winner: +this.props.profileData.id,
      };
    } else {
      results = {
        id1: +this.props.match.params.id,
        id2: +this.props.profileData.id,
        completed: true,
        winner: +this.props.match.params.id,
      };
    }
    fetch(`http://localhost:3001/win/duel/${this.state.duelID}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(results),
    });
    this.setState({ duelID: null });
  };

  render() {
    console.log("SMOTRY SYUDA", this.state, this.props);
    return (
      <>
        <Profile
          {...this.state.user}
          wins={this.state.player.wins}
          rank={this.state.player.rank}
          games={this.state.player.games}
          points={this.state.player.points}
        />
        {this.state.duelID !== null ? (
          this.state.myDuel ? (
            this.state.accepted ? (
              <div className="duel-waiting-block">
                {this.state.resultStatus ? (
                  <button
                    onClick={() =>
                      this.setState({ resultStatus: !this.state.resultStatus })
                    }
                  >
                    ?????????????? ??????????????????
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => this.WinOrLoseHandler("win")}
                      className="win-btn"
                    >
                      ????????????
                    </button>
                    <button
                      onClick={() => this.WinOrLoseHandler("lose")}
                      className="lost-btn"
                    >
                      ??????????????????
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p className="duel-text-message">{this.state.duelMessage}</p>
            )
          ) : this.state.accepted ? (
            <div className="duel-waiting-block">
              {this.state.resultStatus ? (
                <button
                  onClick={() =>
                    this.setState({ resultStatus: !this.state.resultStatus })
                  }
                >
                  ?????????????? ??????????????????
                </button>
              ) : (
                <>
                  <button
                    onClick={() => this.WinOrLoseHandler("win")}
                    className="win-btn"
                  >
                    ????????????
                  </button>
                  <button
                    onClick={() => this.WinOrLoseHandler("lose")}
                    className="lost-btn"
                  >
                    ??????????????????
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="duel-waiting-block">
              <p>{this.state.duelMessage}</p>
              <button onClick={() => this.acceptHandler()}>??????????????</button>
              <button onClick={() => this.ignoreHandler()}>??????????????????</button>
            </div>
          )
        ) : (
          this.props.profileData.name && (
            <div className="user-duel-button">
              <Button
                onClick={() => this.duelHandler()}
                className="duel-button"
                variant="danger"
              >
                ?????????????? ???? ??????????
              </Button>
            </div>
          )
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    inProfile: state.inProfile,
    profileData: state.profileData,
  };
};

const functionFromConnect = connect(mapStateToProps);
const updatedInProfile = functionFromConnect(UserProfile);

export default updatedInProfile;
