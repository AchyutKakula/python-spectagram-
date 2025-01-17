import React, { Component } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Platform, StatusBar, Image, Switch } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

SplashScreen.preventAutoHideAsync();

import {getAuth} from 'firebase/auth';
import {ref, update, onValue} from 'firebase/database';
import db from '../config'

let customFonts = {
	'Bubblegum-Sans': require('../assets/fonts/BubblegumSans-Regular.ttf'),
};

export default class Profile extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fontsLoaded: false,
			isEnabled: false, 
			light_theme: true, 
			name: '',
		};
	}

	toggleSwitch() {
		const previous_state = this.state.isEnabled;
		const theme = !this.state.isEnabled ? 'dark' : 'light';

		const auth = getAuth();
		const user = auth.currentUser;

		if(user) {
			var updates = {};
			updates['users/'+ user.uid + '/current_theme'] = theme;
			const dbRef = ref(db, '/');
			update(dbRef, updates);


			this.setState({isEnabled: !previous_state, light_theme: previous_state});
		}
	}

	async _loadFontsAsync() {
		await Font.loadAsync(customFonts);
		this.setState({ fontsLoaded: true });
	}

	componentDidMount() {
		this._loadFontsAsync();
	}

	async fetchUser() {
		let theme, name, image;
		const auth = getAuth();
		const userID = auth.currentUser.uid;

		onValue(ref(db, '/users/' + userID), (snapshot) => {
			theme = snapshot.val().current_theme;
			name = `${snapshot.val().first_name} ${snapshot.val().last_name}`;
			this.setState ({
				light_theme: theme === 'light' ? true: false, 
				isEnabled: theme === 'light' ? false : true,
				name: name, 
			});
		});
	}

	render() {
		if (this.state.fontsLoaded) {
			SplashScreen.hideAsync();
			return (
				<View style={styles.container}>
					<SafeAreaView style = {styles.droidSafeArea}/>
					<View style = {styles.appTitle}>
						<View style = {styles.appIcon}>
							<Image source={require('../assets/logo.png')} 
							style = {styles.iconImage}></Image>
						</View>
						<View style = {styles.appTitleTextContainer}>
							<Text style={styles.appTitleText} > Storytelling App</Text>
						</View>
					</View>
					<View style = {styles.screenContainer}>
						<View style = {styles.profileImageContainer}>
						<Image
						source = {require('../assets/profile_img.png')}
						style = {styles.profileImage}></Image>
						<Text style = {styles.nameText}>{this.state.name} </Text>
						</View>
						<View style = {styles.themeContainer} >
					<Text style = {styles.themeText}> Dark Theme</Text>
					<Switch
					
					style = {{
						transform: [{ scaleX:1.3}, {scaleY:1.3}],
					}}

					trackColor = {{false: '#767577', true: 'white'}}
					thumbColor = {this.state.isEnabled ? '#ee8249' : '#f4f3f4'}
					ios_backgroundColor= '#3e3e3e'
					onValueChange = {() => this.toggleSwitch()}
					value = {this.state.isEnabled}
					/>
						</View>
						<View style = {{flex:0.3}}/>
						</View>	

					<View style = {{flex:0.08}}/>
				</View>
			);
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#15193c',
	},
	droidSafeArea: {
		marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
	},
	appTitle: {
		flex: 0.07,
		flexDirection: 'row',
	},
	appIcon: {
		flex: 0.3,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'contain',
	},
	appTitleTextContainer: {
		flex: 0.7,
		justifyContent: 'center',
	},
	appTitleText: {
		color: 'white',
		fontSize: RFValue(28),
		fontFamily: 'Bubblegum-Sans',
	},
	screenContainer: {
		flex: 0.85,
	},
	profileImageContainer: {
		flex: 0.5,
		justifyContent: 'center',
		alignItems: 'center',
	},
	profileImage: {
		width: RFValue(140),
		height: RFValue(140),
		borderRadius: RFValue(70),
	},
	nameText: {
		color: 'white',
		fontSize: RFValue(40),
		fontFamily: 'Bubblegum-Sans',
		marginTop: RFValue(10),
	},
	themeContainer: {
		flex: 0.2,
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: RFValue(20),
	},
	themeText: {
		color: 'white',
		fontSize: RFValue(30),
		fontFamily: 'Bubblegum-Sans',
		marginRight: RFValue(15),
	},
});
