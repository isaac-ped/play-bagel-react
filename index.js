function FieldLabel(props) {
	return <label className="field_label"> {props.label}: </label>
}

class FieldEntry extends React.Component {

	constructor(props) {
		super(props)
		this.onChange = this.onChange.bind(this);
	}

	onChange(e) {
		return this.props.onChange(e.target.value);
	}

	render() {
		let input = null;
		if ( "onChange" in this.props && ((!"mutable" in this.props) || this.props.mutable)) {
			input = <input type="text" name={this.props.name} defaultValue={this.props.default_value} onChange={this.onChange}/>
		}
		 else {
			input =  <input type="text" name={this.props.name} value={this.props.default_value} readOnly/>
		}

		return (
			<div>
				<label className="field_label" htmlFor={this.props.name}> {this.props.label}: </label>
				{input}
			</div>		
		)
	}
}


function Guess(props) {
	return (
			<div> {props.word} : {props.number} </div>		
	)
}

class GuessList extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		let guesses = null
		if ('guesses' in this.props && this.props.guesses != undefined)
			guesses = this.props.guesses.map((guess, i) => 
				<Guess word={guess.guess} number={guess.number} key={i} />
			)

		return (
			<div className="guess_list" id={this.props.id}>
				<h5> {this.props.player} </h5>
				{guesses}
			</div>
		)
	}
}


class GuessLists extends React.Component {
	render() {
		const opponent = 'opponent' in this.props.game ? this.props.game.opponent : ""
		console.log("Game: ", this.props.game)
		return (
			<div id="guess_lists"> 
				<GuessList id="left_guesses" 
							guesses={this.props.game.your_guesses}
							player="You"/>
				<GuessList id="right_guesses"
							guesses={this.props.game.other_guesses}
							player={opponent}/>
			</div>
		)
	}
}

class GuessBox extends React.Component {

	constructor(props) {
		super(props)
		this.state= {
			guess:"GUESS!"
		}
		this.set_guess = this.set_guess.bind(this)
		this.do_guess = this.do_guess.bind(this)
	}

	set_guess(e) {
		this.setState({guess: e.target.value})
	}

	do_guess(e) {
		if (this.state.guess.length == 5) {
			this.props.onGuess(this.state.guess)
		}
	}

	render() {
		return (
			<div>
				<label className="field_label" htmlFor="guess_box"> Guess: </label>
				<input type="text" name="guess_box" defaultValue={this.state.guess}
				       onChange={this.set_guess} />
				<input id="go_button" type="submit" value="GO"
					   onClick={this.do_guess} disabled={this.state.guess.length != 5}/>
			</div>
		)
	}
}


class GamePanel extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			game_id: this.props.game.game_id,
			your_word: this.props.game.your_word
		}
		this.setGameId = this.setGameId.bind(this)
		this.setYourWord = this.setYourWord.bind(this)
		this.joinGame = this.joinGame.bind(this)
	}

	setGameId(game_id) {
		this.setState({game_id: game_id})
	}
	setYourWord(word) {
		this.setState({your_word: word})
	}

	joinGame(){
		this.props.onJoinGame(this.state.game_id, this.state.your_word);
	}

	render() {
		console.log("New", this.props.newGame)
		if (!this.props.newGame) {
			let turnText = "waiting for opponent"
			let guessBox = null
			let guessLists = null
			if (this.props.game.opponent != null) {
				turnText = this.props.game.turn + "'s turn"
				guessBox = <GuessBox onGuess={this.props.onGuess}/>
				guessLists = <GuessLists game={this.props.game}/>
			}
			return (
				<div id="game_panel" className="body_contents">
					<FieldEntry label="Game" default_value={this.props.game.game_id}/>
					<FieldEntry label="Your Word" default_value={this.props.game.your_word}/>
					<span className="field_label" id="turn_indicator"> {turnText}</span>
					{guessBox}
					{guessLists}
				</div>
			)
		} else {
			const join =<input id="start_button" type="submit" value="start/join"
						onClick={this.joinGame}/> 
			return (
				<div id="game_panel" className="body_contents">
					<FieldEntry label="Game" default_value={this.state.game_id}
						onChange={this.setGameId} mutable={true}/>
					<FieldEntry label="Your Word" default_value={this.state.your_word}
						onChange={this.setYourWord} mutable={true}/>
					{join}
				</div>
			)
		}

	}
}

class GameLi extends React.Component{

	constructor(props) {
		super(props)
		this.selectGame = this.selectGame.bind(this);
	}

	selectGame() {
		this.props.onSelection(this.props.game);
	}

	render() {
		return <li onClick={this.selectGame}> {this.props.game.game_id} </li>
	}

}

class GamesList extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		const games_li = this.props.games.map((game) => 
			<GameLi key={game.game_id} game={game} onSelection={this.props.onSelection} />)
		return (
			<div>
				<FieldLabel label="Games" />
				<ul id="game_list">
					{games_li}
					<li onClick={this.props.onNewGame} > New Game </li>
				</ul>
			</div>
		)
	}
}

const ENDPOINT="https://vjk7ehax6l.execute-api.us-east-1.amazonaws.com/default/word-entry-microservice"

function make_request(action, req_str) {
	return fetch(ENDPOINT + `?action=${action}&${req_str}`)
			.then(result => result.json())
			.catch((err) => 
				console.log("Error " + err + " interpreting json from " + action))
}

function login_request(user, passwd) {
	return make_request('get_user', `user=${user}&passwd=${passwd}`)
}

function get_game_list_request(user, user_id) {
	return make_request("list_games", `user=${user}&user_id=${user_id}`)
}

function get_game(game_id, user, user_id) {
	return make_request("get_game", `user=${user}&user_id=${user_id}&game_id=${game_id}`)
}

function request_join_game(game_id, user, user_id, word) {
	return make_request("join_game", `user=${user}&user_id=${user_id}&game_id=${game_id}&word=${word}`)
}

function request_guess_word(game_id, user, user_id, word) {
	return make_request("guess_word", `user=${user}&user_id=${user_id}&game_id=${game_id}&word=${word}`)

}

class SideBar extends React.Component {

	render() {
		let games_list = null;
		if (this.props.loggedIn) {
			games_list = (
				<GamesList 
					games={this.props.games}
					onSelection={this.props.onGameSelection} 
					onNewGame={this.props.onNewGame} />
			)
		}

		return  (
			<div id="side_bar" className="body_contents">
				<FieldEntry label="Name" default_value={this.props.username}
					onChange={this.props.onUserChange}
					mutable={!this.props.loggedIn}/>
				<FieldEntry label="Password" default_value={this.props.password} 
					onChange={this.props.onPasswordChange}
					mutable={!this.props.loggedIn}/>
				<input id="create_user_button" type="submit" value="Create User"
					onClick={this.props.onCreateUser} disabled={this.props.loggedIn}
				/>
				<input id="login_button" type="submit" value="Log(ish) In"
					onClick={this.props.onLogin} />
				{games_list}
			</div>
		)
	}
}

class ScratchPanel extends React.Component {
	render() {
		return (
			<div id="scratch_panel" className ="body_contents">
				<textarea defaultValue="scratch space" />
			</div>
			)
	}
}

class BagelBody extends React.Component {
	constructor(props) {
		super(props)
		this.state = {activeGameId: null,
					  gameList: [],
					  newGame: false,
					  username: null,
					  password: null,
					  error: null,
					  userId: -1}
		this.setUsername = this.setUsername.bind(this)
		this.setGame = this.setGame.bind(this);
		this.setNewGame = this.setNewGame.bind(this);
		this.joinGame = this.joinGame.bind(this);
		this.doGuess = this.doGuess.bind(this)
		this.setGameList = this.setGameList.bind(this)
		this.getActiveGame = this.getActiveGame.bind(this)
		this.setPassword = this.setPassword.bind(this)
		this.logIn = this.logIn.bind(this)
	}

	clearError() {
	}

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.refresh(),
      15000
    );
  }

  	refresh() {
  		if (this.state.userId > 0) {
			get_game_list_request(this.state.username, this.state.userId)
			 	.then((res) => {
					if (res.valid) {
						this.setGameList(res['games'])
						this.setState({
							activeGame: this.getActiveGame(res['games'], this.state.activeGameId)
						})
					} else {
						console.log(res)
					}
				}, (error) => {
					console.log("ERROR in joinGame:" + error)
				})
		}
	}

	errorHandler(err) {
		console.log(err)
	}

	setGameList(games) {
		let activeGame = null;
		if (this.state.activeGameId) {
			activeGame = this.getActiveGame(games, this.state.activeGameId)
		}
		this.setState({gameList: games, activeGame: activeGame})

	}

	setGame(game) {
		this.setState({activeGameId: game['game_id'],
					   activeGame: game,
					  newGame: false})
		// this.getActiveGame()
	}

	getActiveGame(game_list, game_id) {
		const active = game_list.filter(game => game.game_id == game_id)
		if (active.length != 1) {
			return null;
		}
		return active[0]
	}

	setUsername(username) {
		this.setState({username: username})
	}

	setUserId(user_id) {
		this.setState({userId: user_id})
	}

	setPassword(password) {
		this.setState({password: password})
	}

	setNewGame() {
		this.setState({activeGame: null, newGame: true})
	}

	joinGame(game_id, word) {
		console.log("JOINING GAME" + game_id, this.state.username, this.state.userId)
		request_join_game(game_id, this.state.username, this.state.userId, word)
			.then((res) => {
				if (res.valid) {
					this.setGameList(res['games'])
					this.setGame(this.getActiveGame(res['games'], game_id))
				} else {
					console.log(res)
				}
			}, (error) => {
				console.log("ERROR in joinGame:" + error)
			})
	}

	logIn() {
		login_request(this.state.username, this.state.password)
			.then((res) => {
				if (res.valid) {
					this.setUserId(res['user_id'])
					this.refresh()
				} else {
					console.log(res)
				}

			}, (error) => {
				console.log("Error in login: " + error)
			})
	}

	createUser() {

	}

	doGuess(guess) {
		request_guess_word(this.state.activeGame.game_id,
						   this.state.username,
						   this.state.userId,
						   guess)
			.then((res) => {
				if (res.valid) {
					this.setGameList(res['games'])
				} else {
					console.log("ERROR in doGuess1", res)
				}
			}, (error) => {
				console.log("ERROR in doGuess2: " + error)
			})
	}

	render() {

		let gamePanel = null
		let scratchPad = null
		if (this.state.activeGame != null ) {
			gamePanel = <GamePanel game={this.state.activeGame}
			   	 				   onGuess={this.doGuess}
			   	 				   refreshGame={this.refresh}
			   	 				   newGame={this.state.newGame}
			   	 				   />
			scratchPad = <ScratchPanel/>
		} else if (this.state.newGame) {
			const new_game = {game_id: ""}
			gamePanel = <GamePanel game={new_game}
								   onJoinGame={this.joinGame}
								   refreshGame={false}
								   newGame={this.state.newGame}/>
		}

		return (
			<div id="bagel_body">
				<SideBar loggedIn={this.state.userId != -1}
						 games={this.state.gameList}
						 onGameSelection={this.setGame} 
						 onNewGame={this.setNewGame} 
						 username={this.state.username}
						 onUserChange={this.setUsername}
						 password={this.state.password}
						 onPasswordChange={this.setPassword}
						 onCreateUser={this.createUser}
						 onLogin={this.logIn}/>
				{gamePanel} {scratchPad}
				<div id="scratch_border"> </div>
			</div>
		)
	}
}

class BagelHeader extends React.Component {
	render() {
		return (
			<div id="header">
				<h1>Bagel!</h1>
			</div>
		)

	}
}


class BagelPage extends React.Component {
  render() {
    return (
      <div>
	      <div id="rule"> </div>
	      <div>
	        <BagelHeader />
	        <BagelBody />
	      </div>
	  </div>
    );
  }
}

ReactDOM.render(
  <BagelPage/>,
  document.getElementById('container')
);
