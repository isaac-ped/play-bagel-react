function FieldLabel(props) {
  return React.createElement("label", {
    className: "field_label"
  }, " ", props.label, ": ");
}

class FieldEntry extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    return this.props.onChange(e.target.value);
  }

  render() {
    let input = null;

    if ("onChange" in this.props && (!"mutable" in this.props || this.props.mutable)) {
      input = React.createElement("input", {
        type: "text",
        name: this.props.name,
        defaultValue: this.props.default_value,
        onChange: this.onChange
      });
    } else {
      input = React.createElement("input", {
        type: "text",
        name: this.props.name,
        value: this.props.default_value,
        readOnly: true
      });
    }

    return React.createElement("div", null, React.createElement("label", {
      className: "field_label",
      htmlFor: this.props.name
    }, " ", this.props.label, ": "), input);
  }

}

function Guess(props) {
  return React.createElement("div", null, " ", props.word, " : ", props.number, " ");
}

class GuessList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let guesses = null;
    if ('guesses' in this.props && this.props.guesses != undefined) guesses = this.props.guesses.map((guess, i) => React.createElement(Guess, {
      word: guess.guess,
      number: guess.number,
      key: i
    }));
    return React.createElement("div", {
      className: "guess_list",
      id: this.props.id
    }, React.createElement("h5", null, " ", this.props.player, " "), guesses);
  }

}

class GuessLists extends React.Component {
  render() {
    const opponent = 'opponent' in this.props.game ? this.props.game.opponent : "";
    console.log("Game: ", this.props.game);
    return React.createElement("div", {
      id: "guess_lists"
    }, React.createElement(GuessList, {
      id: "left_guesses",
      guesses: this.props.game.your_guesses,
      player: "You"
    }), React.createElement(GuessList, {
      id: "right_guesses",
      guesses: this.props.game.other_guesses,
      player: opponent
    }));
  }

}

class GuessBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      guess: "GUESS!"
    };
    this.set_guess = this.set_guess.bind(this);
    this.do_guess = this.do_guess.bind(this);
  }

  set_guess(e) {
    this.setState({
      guess: e.target.value.trim().toLowerCase()
    });
  }

  do_guess(e) {
    if (this.state.guess.length == 5) {
      this.props.onGuess(this.state.guess);
    }
  }

  render() {
    return React.createElement("div", null, React.createElement("label", {
      className: "field_label",
      htmlFor: "guess_box"
    }, " Guess: "), React.createElement("input", {
      type: "text",
      name: "guess_box",
      defaultValue: this.state.guess,
      onChange: this.set_guess
    }), React.createElement("input", {
      id: "go_button",
      type: "submit",
      value: "GO",
      onClick: this.do_guess,
      disabled: this.state.guess.length != 5
    }));
  }

}

class GamePanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game_id: this.props.game.game_id,
      your_word: this.props.game.your_word
    };
    this.setGameId = this.setGameId.bind(this);
    this.setYourWord = this.setYourWord.bind(this);
    this.joinGame = this.joinGame.bind(this);
  }

  setGameId(game_id) {
    game_id = game_id.trim();
    this.setState({
      game_id: game_id
    });
  }

  setYourWord(word) {
    this.setState({
      your_word: word.toLowerCase()
    });
  }

  joinGame() {
    this.props.onJoinGame(this.state.game_id, this.state.your_word);
  }

  render() {
    console.log("New", this.props.newGame);

    if (!this.props.newGame) {
      let turnText = "waiting for opponent";
      let guessBox = null;
      let guessLists = null;
      let delGame = null;

      if (this.props.game.opponent != null) {
        if (this.props.game.winner != null) {
          turnText = this.props.game.winner + " WON!!";

          if (this.props.game.winner == this.props.game.opponent) {
            delGame = React.createElement("input", {
              id: "del_button",
              type: "submit",
              value: "End Game",
              onClick: this.props.onDeleteGame
            });
          }
        } else {
          turnText = this.props.game.turn + "'s turn";
        }

        guessBox = React.createElement(GuessBox, {
          onGuess: this.props.onGuess
        });
        guessLists = React.createElement(GuessLists, {
          game: this.props.game
        });
      }

      return React.createElement("div", {
        id: "game_panel",
        className: "body_contents"
      }, React.createElement(FieldEntry, {
        label: "Game",
        default_value: this.props.game.game_id
      }), React.createElement(FieldEntry, {
        label: "Your Word",
        default_value: this.props.game.your_word
      }), React.createElement("span", {
        className: "field_label",
        id: "turn_indicator"
      }, " ", turnText), delGame, guessBox, guessLists);
    } else {
      const join = React.createElement("input", {
        id: "start_button",
        type: "submit",
        value: "start/join",
        onClick: this.joinGame
      });
      return React.createElement("div", {
        id: "game_panel",
        className: "body_contents"
      }, React.createElement(FieldEntry, {
        label: "Game",
        default_value: this.state.game_id,
        onChange: this.setGameId,
        mutable: true
      }), React.createElement(FieldEntry, {
        label: "Your Word",
        default_value: this.state.your_word,
        onChange: this.setYourWord,
        mutable: true
      }), join);
    }
  }

}

class GameLi extends React.Component {
  constructor(props) {
    super(props);
    this.selectGame = this.selectGame.bind(this);
  }

  selectGame() {
    this.props.onSelection(this.props.game);
  }

  render() {
    const is_turn = 'opponent' in this.props.game && this.props.game.opponent != this.props.game.turn;
    return React.createElement("li", {
      onClick: this.selectGame
    }, " ", is_turn ? "***" : "", " ", this.props.game.game_id, " ");
  }

}

class GamesList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const games_li = this.props.games.map(game => React.createElement(GameLi, {
      key: game.game_id,
      game: game,
      onSelection: this.props.onSelection
    }));
    return React.createElement("div", null, React.createElement(FieldLabel, {
      label: "Games"
    }), React.createElement("ul", {
      id: "game_list"
    }, games_li, React.createElement("li", {
      onClick: this.props.onNewGame
    }, " New Game ")));
  }

}

const ENDPOINT = "https://vjk7ehax6l.execute-api.us-east-1.amazonaws.com/default/word-entry-microservice";

function make_request(action, req_str) {
  return fetch(ENDPOINT + `?action=${action}&${req_str}`).then(result => result.json()).catch(err => console.log("Error " + err + " interpreting json from " + action));
}

function login_request(user, passwd) {
  return make_request('get_user', `user=${user}&passwd=${passwd}`);
}

function get_game_list_request(user, user_id) {
  return make_request("list_games", `user=${user}&user_id=${user_id}`);
}

function get_game(game_id, user, user_id) {
  return make_request("get_game", `user=${user}&user_id=${user_id}&game_id=${game_id}`);
}

function request_join_game(game_id, user, user_id, word) {
  return make_request("join_game", `user=${user}&user_id=${user_id}&game_id=${game_id}&word=${word}`);
}

function request_delete_game(game_id, user, user_id) {
  return make_request("delete_game", `user=${user}&user_id=${user_id}&game_id=${game_id}`);
}

function request_guess_word(game_id, user, user_id, word) {
  return make_request("guess_word", `user=${user}&user_id=${user_id}&game_id=${game_id}&word=${word}`);
}

class SideBar extends React.Component {
  render() {
    let games_list = null;

    if (this.props.loggedIn) {
      games_list = React.createElement(GamesList, {
        games: this.props.games,
        onSelection: this.props.onGameSelection,
        onNewGame: this.props.onNewGame
      });
    }

    return React.createElement("div", {
      id: "side_bar",
      className: "body_contents"
    }, React.createElement(FieldEntry, {
      label: "Name",
      default_value: this.props.username,
      onChange: this.props.onUserChange,
      mutable: !this.props.loggedIn
    }), React.createElement(FieldEntry, {
      label: "Password",
      default_value: this.props.password,
      onChange: this.props.onPasswordChange,
      mutable: !this.props.loggedIn
    }), React.createElement("input", {
      id: "create_user_button",
      type: "submit",
      value: "Create User",
      onClick: this.props.onCreateUser,
      disabled: this.props.loggedIn
    }), React.createElement("input", {
      id: "login_button",
      type: "submit",
      value: "Log(ish) In",
      onClick: this.props.onLogin
    }), games_list);
  }

}

class ScratchPanel extends React.Component {
  constructor(props) {
    super(props);
    this.saveText = this.saveText.bind(this);
    let contents = "scratch space";

    if (this.props.game != null) {
      const stored_contents = localStorage.getItem("SCRATCH_" + this.props.game.game_id);

      if (stored_contents) {
        contents = stored_contents;
      }
    }

    this.state = {
      contents: contents
    };
  }

  saveText(e) {
    this.setState({
      contents: e.target.value
    });
    if (this.props.game != null) localStorage.setItem("SCRATCH_" + this.props.game.game_id, e.target.value);
  }

  render() {
    let contents = this.state.contents;

    if (this.props.game != null) {
      const stored_contents = localStorage.getItem("SCRATCH_" + this.props.game.game_id);

      if (stored_contents) {
        contents = stored_contents;
      }
    }

    return React.createElement("div", {
      id: "scratch_panel",
      className: "body_contents"
    }, React.createElement("textarea", {
      value: contents,
      onChange: this.saveText
    }));
  }

}

class BagelBody extends React.Component {
  constructor(props) {
    super(props);
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    this.state = {
      activeGameId: null,
      gameList: [],
      newGame: false,
      username: username,
      password: password,
      error: null,
      userId: -1
    };
    this.setUsername = this.setUsername.bind(this);
    this.setGame = this.setGame.bind(this);
    this.setNewGame = this.setNewGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.doGuess = this.doGuess.bind(this);
    this.setGameList = this.setGameList.bind(this);
    this.getActiveGame = this.getActiveGame.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.logIn = this.logIn.bind(this);
    this.deleteGame = this.deleteGame.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
    this.clearError = this.clearError.bind(this);
  }

  clearError() {
    console.log("Clearing error");
    this.setState({
      error: null
    });
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.refresh(), 15000);
  }

  refresh() {
    if (this.state.userId > 0) {
      get_game_list_request(this.state.username, this.state.userId).then(res => {
        if (res.valid) {
          this.setGameList(res['games']);
          this.setState({
            activeGame: this.getActiveGame(res['games'], this.state.activeGameId)
          });
          this.clearError();
        } else {
          console.log(res);
          this.errorHandler(res.err);
        }
      }, error => {
        this.errorHandler(error);
        console.log("ERROR in joinGame:" + error);
      });
    }
  }

  errorHandler(err) {
    console.log("ERROR", err, err.toString());
    this.setState({
      error: err.toString()
    });
  }

  setGameList(games) {
    let activeGame = null;

    if (this.state.activeGameId) {
      activeGame = this.getActiveGame(games, this.state.activeGameId);
    }

    this.setState({
      gameList: games,
      activeGame: activeGame
    });
  }

  setGame(game) {
    this.setState({
      activeGameId: game['game_id'],
      activeGame: game,
      newGame: false
    }); // this.getActiveGame()
  }

  getActiveGame(game_list, game_id) {
    const active = game_list.filter(game => game.game_id == game_id);

    if (active.length != 1) {
      return null;
    }

    return active[0];
  }

  setUsername(username) {
    this.setState({
      username: username
    });
  }

  setUserId(user_id) {
    this.setState({
      userId: user_id
    });
  }

  setPassword(password) {
    this.setState({
      password: password
    });
  }

  setNewGame() {
    this.setState({
      activeGame: null,
      newGame: true
    });
  }

  joinGame(game_id, word) {
    console.log("JOINING GAME" + game_id, this.state.username, this.state.userId);
    request_join_game(game_id, this.state.username, this.state.userId, word).then(res => {
      if (res.valid) {
        this.setGameList(res['games']);
        this.setGame(this.getActiveGame(res['games'], game_id));
        this.clearError();
      } else {
        console.log(res);
        this.errorHandler(res.err);
        this.setState({
          activeGame: null,
          activeGameId: null
        });
      }
    }, error => {
      this.errorHandler(error);
      console.log("ERROR in joinGame:" + error);
    });
  }

  logIn() {
    localStorage.setItem('username', this.state.username);
    localStorage.setItem('password', this.state.password);
    login_request(this.state.username, this.state.password).then(res => {
      if (res.valid) {
        this.setUserId(res['user_id']);
        this.refresh();
        this.clearError();
      } else {
        this.errorHandler(res.err);
        console.log(res);
      }
    }, error => {
      this.errorHandler(error);
      console.log("Error in login: " + error);
    });
  }

  deleteGame() {
    request_delete_game(this.state.activeGame.game_id, this.state.username, this.state.userId).then(res => {
      if (res.valid) {
        this.setNewGame();
        this.setGameList(res['games']);
        this.clearError();
      } else {
        console.log("Error in reqeuest delete game", res);
      }
    }, error => {
      this.errorHandler(err);
      console.log("Error in rdg", error);
    });
  }

  createUser() {}

  doGuess(guess) {
    request_guess_word(this.state.activeGame.game_id, this.state.username, this.state.userId, guess.toLowerCase().trim()).then(res => {
      if (res.valid) {
        this.setGameList(res['games']);
        this.clearError();
      } else {
        console.log("ERROR in doGuess1", res);
        this.errorHandler(res.err);
      }
    }, error => {
      this.errorHandler(error);
      console.log("ERROR in doGuess2: " + error);
    });
  }

  render() {
    let gamePanel = null;
    let scratchPad = null;
    let errorMsg = null;

    if (this.state.error != null) {
      errorMsg = React.createElement("span", {
        id: "error_msg"
      }, " ", this.state.error, " ");
    }

    if (this.state.activeGame != null) {
      gamePanel = React.createElement(GamePanel, {
        game: this.state.activeGame,
        onGuess: this.doGuess,
        refreshGame: this.refresh,
        newGame: this.state.newGame,
        onDeleteGame: this.deleteGame
      });
      scratchPad = React.createElement(ScratchPanel, {
        game: this.state.activeGame
      });
    } else if (this.state.newGame) {
      const new_game = {
        game_id: ""
      };
      gamePanel = React.createElement(GamePanel, {
        game: new_game,
        onJoinGame: this.joinGame,
        refreshGame: false,
        newGame: this.state.newGame
      });
    }

    return React.createElement("div", {
      id: "bagel_body"
    }, errorMsg, React.createElement(SideBar, {
      loggedIn: this.state.userId != -1,
      games: this.state.gameList,
      onGameSelection: this.setGame,
      onNewGame: this.setNewGame,
      username: this.state.username,
      onUserChange: this.setUsername,
      password: this.state.password,
      onPasswordChange: this.setPassword,
      onCreateUser: this.createUser,
      onLogin: this.logIn
    }), gamePanel, " ", scratchPad, React.createElement("div", {
      id: "scratch_border"
    }, " "));
  }

}

class BagelHeader extends React.Component {
  render() {
    return React.createElement("div", {
      id: "header"
    }, React.createElement("h1", null, "Bagel!"));
  }

}

class BagelPage extends React.Component {
  render() {
    return React.createElement("div", null, React.createElement("div", {
      id: "rule"
    }, " "), React.createElement("div", null, React.createElement(BagelHeader, null), React.createElement(BagelBody, null)));
  }

}

ReactDOM.render(React.createElement(BagelPage, null), document.getElementById('container'));