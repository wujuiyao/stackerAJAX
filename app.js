$(document).ready( function() {
	$('.unanswered-getter').submit( function(event){
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});
	$('.inspiration-getter').submit(function(event){
		$('.results').html('');
		var answerers = $(this).find("input[name='answerers']").val();
		console.log(answerers);
		getAnswers(answerers);
  });
});
// this function takes the question object returned by StackOverflow
// and creates new result to be appended to DOM

//ask nicholas, why do they add the showQuestion like that
var showQuestion = function(question) {

	// clone our result template code
	var result = $('.templates .question').clone();

	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the #views for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
													question.owner.display_name +
												'</a>' +
							'</p>' +
 							'<p>Reputation: ' + question.owner.reputation + '</p>'
	);
	return result;
};

// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = '<br>' + resultNum + ' results for <strong>' + query;
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};
// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	// the parameters we need to pass in our request to StackOverflow's API
	var request = {tagged: tags,
								site: 'stackoverflow',
								order: 'desc',
								sort: 'creation'};
	var result = $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
	})
	.done(function(result){
		var searchResults = showSearchResults(request.tagged, result.items.length);
		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

var showAnswer = function(answer) {

	var result = $('.templates .answer').clone();

	// Set the Name of top answerers, include hyperlink
	var answerName = result.find('.answerer-name a');
	answerName.attr('href', answer.user.link);
	answerName.text(answer.user.display_name);

	// Set the profile image
  var profileImage = result.find('.profile-image a');
	var imageLink = answer.user.profile_image;
	profileImage.attr('href', answer.user.link);
	profileImage.prepend('<img src="'+ imageLink + '" alt="">');

	//Show the score
	var score = result.find('.answerer-score');
	var answererScore = answer.score;
	score.html(answererScore);

	return result;
};

var getAnswers = function(answerers){
	var url = "http://api.stackexchange.com/2.2/tags/" + answerers + "/top-answerers/all_time";
	var request = {site: 'stackoverflow'};

	var topAnswers = $.ajax({
		url: url,
		data: request,
		dataType: "jsonp",
		type: "GET",
	})
	.done(function(topAnswers){
		console.log(topAnswers);
		var searchResults = showSearchResults(answerers, topAnswers.items.length);
		$('.search-results').html(searchResults);

		$.each(topAnswers.items, function(index, item){
			var showTopAnswer = showAnswer(item);
			$('.results').append(showTopAnswer);
		});
	})
	.fail(function(){
		console.log("fail");
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};
