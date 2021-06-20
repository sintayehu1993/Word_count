import './App.css';
import { Component } from 'react';
import { compose } from 'ramda';
class App extends Component {
  state = {
    text: '',
    charCount: 0,
    wordCount: 0,
    sentenceCount: 0,
    paragraphCount: 0,
    BigramsCount: 0,
    maxWord: '',
  };
  componentDidMount() {
    this.getText()
      .then((text) => {
        this.setState({ text: text.join('\n\n') }, () =>
          this.setCounts(this.state.text)
        );
      })
      .catch((err) => this.setState({ text: `Error: ${err.message}` }));
  }

  /*
    Fetches paragraphs from https://baconipsum.com/
  */
  getText = async () => {
    const res = await fetch(
      'https://baconipsum.com/api/?type=all-meat&paras=2'
    );

    const body = await res.json();

    if (res.status !== 200) throw Error(body.message);

    return body;
  };
  removeBreaks = (arr) => {
    const index = arr.findIndex((el) => el.match(/\r?\n|\r/g));

    if (index === -1) return arr;

    const newArray = [
      ...arr.slice(0, index),
      ...arr[index].split(/\r?\n|\r/),
      ...arr.slice(index + 1, arr.length),
    ];

    return this.removeBreaks(newArray);
  };
 
  removeEmptyElements = (arr) => {
    const index = arr.findIndex((element ) => element.trim() === '');

    if (index === -1) return arr;

    arr.splice(index, 1);

    return this.removeEmptyElements(arr);
  };

  setCounts = (value) => {
    let trimmedValue = value.trim();
    const words = compose(
      this.removeEmptyElements,
      this.removeBreaks
    )(trimmedValue.split(' '));

    const sentences = compose(
      this.removeEmptyElements,
      this.removeBreaks
    )(trimmedValue.split('.'));

    const paragraphs = this.removeEmptyElements(trimmedValue.split(/\r?\n|\r/));

    const maxExistingWord = () => {
      let objWordMap = {};
      let max = 0;
      let maxWord = [];
      for (let word of words) {
        let currentWord = word.replace(/\W/g, '');
        if (objWordMap[currentWord]) {
          objWordMap[currentWord]++;
        } else {
          objWordMap[currentWord] = 1;
        }
      }
      for (let word in objWordMap) {
        if (objWordMap[word] === max) {
          max = objWordMap[word];
          maxWord.push(word);
        }
        if (objWordMap[word] > max) {
          max = objWordMap[word];
          maxWord.length = 0;
          maxWord.push(word);
        }
      }

      let finalResult = `${maxWord.join(', ')}  Count:${max}`;
      return finalResult;
    };
    const bigramsCount = () => {
      let objPairsMap = {};
      let total = 0;
      for (let i = 0; i < words.length - 1; i++) {
        let pairs =
          words[i].replace(/\W/g, '') + ' ' + words[i + 1].replace(/\W/g, '');
        if (objPairsMap[pairs]) {
          objPairsMap[pairs]++;
        } else {
          objPairsMap[pairs] = 1;
        }
      }
      for (const key in objPairsMap) {
        total = total + objPairsMap[key];
      }
      return total;
    };
    this.setState({
      text: value,
      charCount: trimmedValue.length,
      wordCount: value === '' ? 0 : words.length,
      sentenceCount: value === '' ? 0 : sentences.length,
      paragraphCount: value === '' ? 0 : paragraphs.length,
      BigramsCount: value === '' ? 0 : bigramsCount(),
      maxWord: value === '' ? '' : maxExistingWord(),
    });
  };

  handleChange = (e) => this.setCounts(e.target.value);
  render() {
    return (
      <div className="App-header">
        <h>Word Count</h>
        <div>
          <textarea
            rows="20"
            onChange={this.handleChange}
            value={this.state.text}
            placeholder="place your text here..."
          ></textarea>
          <p className="result">
            <strong>Character Count:</strong> {this.state.charCount}
            <br />
            <strong>Word Count:</strong> {this.state.wordCount}
            <br />
            <strong>Sentence Count:</strong> {this.state.sentenceCount}
            <br />
            <strong>Paragraph Count:</strong> {this.state.paragraphCount}
            <br />
            <strong>Bigrams:</strong> {this.state.BigramsCount}
            <br />
            <strong>
              Max existing word or words: {this.state.maxWord}
            </strong>
          </p>
        </div>
      </div>
    );
  }
}

export default App;
