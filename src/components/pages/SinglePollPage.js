import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Pie } from 'react-chartjs-2';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import purple from '@material-ui/core/colors/purple';
import prepareChart from './../../utils/prepareChart';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

class SinglePollPage extends Component {
  state = {
    poll: {},
    isAuthorized: false,
    newOption: '',
    optionToVote: '',
  }

  componentDidMount() {
    const { currentUserId } = this.props;
    const { poll_id } = this.props.match.params;
    const API = axios.create({
      baseURL: 'http://localhost:3000',
    });
    API.get(`/polls/${poll_id}`)
      .then((response) => {
        const poll = response.data[0];
        this.setState({ poll });
        this.setState({ optionToVote: poll.options[0]._id });
        if (poll.userId === currentUserId) {
          this.setState({ isAuthorized: true });
        }
      })
      .catch((error) => {
        if (error.response.statusText === 'Not Found') {
          this.props.history.push('/not-found');
        }
      });
  }

  handleChange = name => event => this.setState({ [name]: event.target.value });

  handleSelect = event => this.setState({ [event.target.name]: event.target.value });

  shareOnTwitter = () => {
    window.open('https://twitter.com/intent/tweet?text=Hey, check out this cool poll!!!', '_blank');
  }

  vote = () => {
    const API = axios.create({
      baseURL: 'http://localhost:3000',
    });
    API.patch(`polls/${this.state.poll._id}/${this.state.optionToVote}/up`)
      .then(response => this.setState({ poll: response.data.poll }))
      .catch(error => console.error('There has been an error with voting', error));
  }

  deletePoll = () => {
    const API = axios.create({
      baseURL: 'http://localhost:3000',
    });
    API.delete(`/polls/${this.state.poll._id}`).then(() => this.props.history.push('/'));
  }

  addNewOption = () => {
    const { newOption } = this.state;
    if (newOption.length > 0) {
      const API = axios.create({
        baseURL: 'http://localhost:3000',
      });
      API.post(`/polls/${this.state.poll._id}/option`, {
        newOption: {
          title: newOption,
        },
      })
        .then(response => this.setState({ poll: response.data.poll }))
        .then(() => this.setState({ newOption: '' }))
        .catch((error) => {
          console.log(error);
        });
    }
  }

  render() {
    const { isAuthorized, newOption, optionToVote } = this.state;
    const {
      title, options,
    } = this.state.poll;
    const { isAuthenticated } = this.props;
    let optionsDiv;
    if (options) {
      optionsDiv = (
        <FormControl>
          <InputLabel htmlFor="option-helper">Option</InputLabel>
          <Select
            value={optionToVote}
            onChange={this.handleSelect}
            input={<Input name="optionToVote" id="option-helper" />} 
          >
            {options.map((option, i) => (
              <MenuItem key={option._id} value={option._id}>{option.title}</MenuItem>
            ))}
          </Select>
          <FormHelperText>Option you want to vote on</FormHelperText>
        </FormControl>
      );
    } else {
      optionsDiv = <CircularProgress style={{ color: purple[500] }} thickness={7} />;
    }
    let chart;
    if (options) {
      chart = <Pie data={prepareChart(options)} />;
    } else {
      chart = <CircularProgress color="secondary" />;
    }
    return (
      <div style={{ padding: '18px' }}>
        <Grid container spacing={24} justify="center">
          <Grid item xs={8} md={3} xl={2}>
            <Paper elevation={4}>
              { isAuthenticated && (
                <Fragment>
                  <div style={{ width: '100%', color: 'white', backgroundColor: '#2196F3', padding: '18px', boxSizing: 'border-box', textAlign: 'left'}}>
                    Missing options?
                  </div>
                  <div style={{ padding: '0 18px 36px 18px' }}>
                    <form onSubmit={this.addNewOption}>
                      <TextField
                        id="new-option"
                        label="New option"
                        margin="normal"
                        value={newOption}
                        onChange={this.handleChange('newOption')}
                      />
                      <br />
                      <Button type="submit" variant="raised" size="small" color="primary">
                        Add new option
                      </Button>
                    </form>
                  </div>
                </Fragment>
                )
              }
            </Paper>
            <Paper elevation={4}>
            { isAuthorized && (
                
              <Fragment>
                <div style={{ width: '100%', color: 'white', backgroundColor: '#F44336', padding: '18px', marginTop: '18px', boxSizing: 'border-box', textAlign: 'left'}}>
                  Danger Zone
                </div>
                <div style={{ padding: '18px' }}>
                    <Button onClick={this.deletePoll} type="button" variant="raised" size="small" color="secondary">
                        Delete Poll
                    </Button>
                </div>
              </Fragment>
              )
            }
            </Paper>
          </Grid>
          <Grid item xs={12} md={8} xl={8}>
            <Paper elevation={4}>
              <div style={{ width: '100%', color: 'white', backgroundColor: '#2196F3', padding: '18px', boxSizing: 'border-box', textAlign: 'left'}}>
                <Grid container justify="space-between" alignItems="center">
                  <Grid item>
                    <Typography variant="title" color="inherit">
                      {title}
                    </Typography>
                  </Grid>
                  <Grid item>
                    { isAuthenticated && (
                      <Button onClick={this.shareOnTwitter} variant="raised" size="small" color="primary">
                        Share on Twitter
                      </Button>
                      )
                    }
                  </Grid>
                </Grid>
              </div>
              {chart}
              <div style={{ padding: '24px' }}>
                {optionsDiv}
                <div style={{ marginTop: '20px' }}>
                  <Button onClick={this.vote} variant="raised" size="small" color="primary">
                      Vote
                  </Button>
                </div>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

SinglePollPage.propTypes = {
  currentUserId: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      poll_id: PropTypes.node,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  currentUserId: state.user.id,
  isAuthenticated: !!state.user.token,
});

export default connect(mapStateToProps)(SinglePollPage);