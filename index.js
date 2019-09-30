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
			input = <input type="text" name={this.props.name} value={this.props.default_value} onChange={this.onChange}/>
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
		if ('guesses' in this.props)
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
		console.log("Game: ", this.props.game)
		return (
			<div id="guess_lists"> 
				<GuessList id="left_guesses" guesses={this.props.game.user_guesses} player="You"/>
				<GuessList id="right_guesses" guesses={this.props.game.other_guesses} player={this.props.game.opponent}/>
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
		this.props.do_guess(this.state.guess)
	}

	render() {
		return (
			<div>
				<label className="field_label" htmlFor="guess_box"> Guess: </label>
				<input type="text" name="guess_box" defaultValue={this.state.guess}
				       onChange={this.set_guess} />
				<input id="go_button" type="submit" value="GO"
					   onClick={this.do_guess}/>
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
		this.set_game_id = this.set_game_id.bind(this)
		this.set_your_word = this.set_your_word.bind(this)
		this.refresh = this.refresh.bind(this)
	}

	refresh() {
		console.log("Refreshing")
		if ('game' in this.props) {
			this.props.refresh_game({name: this.props.game.game_id})
		}
	}

	componentDidMount() {
		console.log("Mounted")
		this.timerID = setInterval(
			() => this.refresh(),
			15000
		);
	}

	componentWillUnmount() {
		console.log("Unmounting");
		clearInterval(this.timerID);
	}

	set_game_id(game_id) {
		this.setState({game_id: game_id})
	}
	set_your_word(word) {
		this.setState({yor_word: word})
	}

	render() {
		if (this.props.in_progress) {
			return (
				<div id="game_panel" className="body_contents">
					<FieldEntry label="Game" default_value={this.props.game.game_id}/>
					<FieldEntry label="Your Word" default_value={this.props.game.your_word}/>
					<span className="field_label" id="turn_indicator"> {this.props.game.turn}'s turn</span>
					<GuessBox do_guess={this.props.do_guess}/>
					<GuessLists game={this.props.game}/>
				</div>
			)
		} else {
			return (
				<div id="game_panel" className="body_contents">
					<FieldEntry label="Game" default_value={this.props.game.game_id}
						onChange={this.set_game_id}/>
					<FieldEntry label="Your Word" default_value="farts"
						onChange={this.set_your_word}/>
					<input id="start_button" type="submit" value="start/join"
						onClick={this.props.join_game(this.state.game_id, this.state.word)}/> 
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
		return <li onClick={this.selectGame}> {this.props.game.name} </li>
	}

}

class GamesList extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		const games_li = this.props.games.map((game) => 
			<GameLi key={game.name} game={game} onSelection={this.props.onSelection} />)
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

	constructor(props) {
		super(props);
		this.state = {
			logged_in: false,
			games: [],
			error: null,
			password: "Passwd",
			username: "Your Name"
		}
		this.do_create_user = this.do_create_user.bind(this);
		this.do_log_in = this.do_log_in.bind(this);
		this.do_set_user = this.do_set_user.bind(this);
		this.do_set_password =this.do_set_password.bind(this);

	}

	do_set_user(val) {
		this.setState({username:val})
	}

	do_set_password(val) {
		this.setState({password:val})
	}

	do_create_user() {
		this.setState({logged_in:true, games:[]})
	}

	do_log_in() {
		login_request(this.state.username, this.state.password)
			.then(res => res.json())
			.then(
				(result) => {
					if (result.valid) {
						this.setState({
							error:null,
							user_id: result.user_id
						})
						this.props.set_user(result)
						return get_game_list_request(this.state.username, result.user_id)
					} else {
						this.setState({
							error:result.err,
							user_id: -1
						})
					}
				},
				(error) => {
					this.setState({
						logged_in:false,
						error:error
					})
				}
			)
			.then((result) => result.json())
			.then((result) => {
				console.log("game list", result)
				if (result === undefined) {
					return
				}
				if (result.valid) {
					this.setState({
						logged_in: true,
						error: null,
						games: result.games
					})
				} else {
						this.setState({
							error:result.err,
							user_id: -1
						})
						return {valid: false}
				}},
				(error) => {
					console.log(error)
					this.setState({
						logged_in: false,
						error: error.message
					})
				})				
	}

	render() {

		let games_list = null;
		if (this.state.logged_in) {
			games_list = (
				<GamesList 
					games={this.state.games}
					onSelection={this.props.onGameSelection} 
					onNewGame={this.props.onNewGame} />
			)
		}
		let error = null;
		if (this.state.error != null) {
			error = <span id="error"> ERROR! {this.state.error} </span>
		}

		return  (
			<div id="side_bar" className="body_contents">
				<FieldEntry label="Name" default_value={this.state.username}
					onChange={this.do_set_user}
					mutable={!this.state.logged_in}/>
				<FieldEntry label="Password" default_value={this.state.password} 
					onChange={this.do_set_password}
					mutable={!this.state.logged_in}/>
				<input id="create_user_button" type="submit" value="Create User"
					onClick={this.do_create_user} disabled={this.state.logged_in}
				/>
				<input id="login_button" type="submit" value="Log(ish) In"
					onClick={this.do_log_in} />
				{games_list}
				{error}
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
		this.state = {activeGame: null,
					  newGame: false,
					  user: null,
					  user_id: -1}
		this.setUser = this.setUser.bind(this)
		this.setGame = this.setGame.bind(this);
		this.setNewGame = this.setNewGame.bind(this);
		this.joinGame = this.joinGame.bind(this);
		this.doGuess = this.doGuess.bind(this)
	}

	setGame(game) {
		console.log('game is', game)
		get_game(game['name'], this.state.user, this.state.user_id)
			.then(res => res.json())
			.then((res) => {
				console.log("game dtails", res)
				this.setState({activeGame: res})
			},(error) => {
				console.log("ERROR in setGame:" + error)
			}
			)
	}

	setUser(user) {
		this.setState({user: user['user_name'], user_id:user['user_id']})
	}

	setNewGame() {
		this.setState({activeGame: null, newGame: true})
	}

	joinGame(game_id, word) {
		request_join_game(game_id, this.state.user, this.state.user_id, word)
			.then(res => res.json())
			.then((res) => {
				this.setState({activeGame: res})
			}, (error) => {
				console.log("ERROR in joinGame:" + error)
			})
	}

	doGuess(guess) {
		console.log("GUESSSSGGIN", guess)
		request_guess_word(this.state.activeGame.game_id,
						   this.state.user,
						   this.state.user_id,
						   guess)
			.then(res => res.json())
			.then((res) => {
				if (res.valid) {
					this.setState({activeGame: res})
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
		if (this.state.activeGame != null) {
			gamePanel = <GamePanel game={this.state.activeGame}
			   	 				   in_progress={true}
			   	 				   do_guess={this.doGuess}
			   	 				   refresh_game={this.setGame}
			   	 				   />
			scratchPad = <ScratchPanel/>
		} else if (this.state.newGame) {
			const new_game = {game_id: ""}
			gamePanel = <GamePanel game={new_game} in_progress={false}
								   join_game={this.joinGame} />
		}

		return (
			<div id="bagel_body">
				<SideBar onGameSelection={this.setGame} 
						 onNewGame={this.setNewGame} 
						 set_user={this.setUser} />
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
