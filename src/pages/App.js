import React from 'react';
import { useParams } from 'react-router-dom';
import tmi from 'tmi.js';
import Twitch from 'node-twitch';
import ReactPlayer from 'react-player';
import { Box, Container, FormControlLabel, FormGroup, IconButton, Paper, Stack, Switch } from '@mui/material';
import { PlayCircle, RemoveCircle } from '@mui/icons-material';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      channelName: this.props.params.channel,
      channelBanner: '',
      clipsEnabled: false,
      playEnabled: false,
      queuedClips: [],
      watchedClips: [],
      currentClip: null,
    }

    this.client = {
      API: new Twitch({ client_id: process.env.REACT_APP_TWITCH_CLIENT_ID, client_secret: process.env.REACT_APP_TWITCH_CLIENT_SECRET }),
      TMI: new tmi.Client({ options: { debug: false }, connection: { secure: true, reconnect: true }, channels: [this.state.channelName] }),
    }

    this.client.TMI.connect();
    this.client.TMI.on("message", (channel, user, message, self) => {
      if (self) return;
      this.handleNewClip(message.trim());
    });
    this.getBanner();
  }

  async getBanner() {
    let user = await this.client.API.getUsers(this.state.channelName);
    this.setState({ channelBanner: user.data[0].offline_image_url })
  }

  async handleNewClip(message) {

    if (!this.state.clipsEnabled) { return }

    const regex = new RegExp('https?:\\/\\/?:www\\.|(?!www)(youtube\\.com\\/watch\\?v=|ripvod\\.com|streamable\\.com|twitch\\.tv\\/\\S+\\/clip\\/|clips\\.twitch\\.tv\\/)(\\S+)', 'im');
    var getClip = regex.exec(message);

    if (getClip === null || getClip === undefined ) { return }

    const clipUrl = getClip[0];
    const urlSplit = clipUrl.split("/");
    const clipHost = urlSplit[0];
    const clipSlug = urlSplit[urlSplit.length - 1].split(".")[0];

    if (this.state.queuedClips.some(video => video.slug === clipSlug)) { return }
    if (this.state.watchedClips.some(video => video.slug === clipSlug)) { return }

    if (clipHost.includes("twitch.tv")) {
      try {
        const clip = await this.client.API.getClips({ id: clipSlug });
        if (clip.data.length > 0) {
          const clipObj = { slug: clipSlug, image: clip.data[0].thumbnail_url, video: clip.data[0].thumbnail_url.split("-preview-")[0] + ".mp4" };
          if (this.state.queuedClips.length === 0) {
            this.setState({ currentClip: clipObj });
          }
          this.setState({ queuedClips: [...this.state.queuedClips, clipObj] });
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (clipHost.includes("ripvod.com")) {
      try {
        const clipObj = { slug: clipSlug, image: 'https://cfw.ripvod.com/' + urlSplit[1] + '/clip/' + clipSlug + '.jpg', video: 'https://cfw.ripvod.com/' + urlSplit[1] + '/' + clipSlug + '.mp4' };
        if (this.state.queuedClips.length === 0) {
          this.setState({ currentClip: clipObj });
        }
        this.setState({ queuedClips: [...this.state.queuedClips, clipObj] });
      } catch (error) {
        console.error(error);
      }
    }

    if (clipHost.includes("streamable.com")) {
      try {
        const clipObj = { slug: clipSlug, image: 'https://cdn-cf-east.streamable.com/image/' + clipSlug + '.jpg', video: clipUrl };
        if (this.state.queuedClips.length === 0) {
          this.setState({ currentClip: clipObj });
        }
        this.setState({ queuedClips: [...this.state.queuedClips, clipObj] });
      } catch (error) {
        console.error(error);
      }
    }

    if (clipHost.includes("youtube.com")) {
      try {
        const clipObj = { slug: clipSlug.replace('watch?v=', ''), image: 'http://img.youtube.com/vi/' + clipSlug.replace('watch?v=', '') + '/sddefault.jpg', video: clipUrl };
        if (this.state.queuedClips.length === 0) {
          this.setState({ currentClip: clipObj });
        }
        this.setState({ queuedClips: [...this.state.queuedClips, clipObj] });
      } catch (error) {
        console.error(error);
      }
    }
  }

  playNextClip = () => {

    let newQueue = this.state.queuedClips.filter(video => video.slug !== this.state.currentClip.slug);
    this.setState({ queuedClips: newQueue });
    if (this.state.queuedClips.length > 0) {
      this.setState({ currentClip: newQueue[0] });
      return;
    }
    this.setState({ currentClip: null });
  };

  handlePlayChange = (event) => {
    this.setState({ playEnabled: event.target.checked })
  };

  handleClipChange = (event) => {
    this.setState({ clipsEnabled: event.target.checked })
  };

  handleShowControls = (e, status) => {
    e.currentTarget.firstChild.style.display = status ? 'flex' : 'none';
  };

  handlePlayButton = (e, play) => {
    this.setState({ queuedClips: [play, ...this.state.queuedClips.filter(video => video.slug !== play.slug)] });
    this.setState({ currentClip: play });
  };

  handleSkipButton = (e, skip) => {
    let newQueue = this.state.queuedClips.filter(video => video.slug !== skip.slug);
    this.setState({ queuedClips: newQueue });
    if (this.state.queuedClips.length > 0) {
      this.setState({ currentClip: newQueue[0] });
      return;
    }
    this.setState((currentClip) => { return null });
  };

  getCurrentVideo = () => {
    if (this.state.currentClip === null || this.state.currentClip === undefined) { return null }
    return this.state.currentClip.video;
  };

  render() {
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Paper sx={{ p: 2 }}>
          <Box width='75%' m='1rem auto' sx={{ backgroundImage: `url(${this.state.channelBanner})`, backgroundSize: 'cover', aspectRatio: '16 / 9' }}>
            <ReactPlayer
              className='react-player'
              url={this.getCurrentVideo()}
              volume={0.1}
              playing={this.state.playEnabled}
              onEnded={this.playNextClip}
              width='100%'
              height='100%'
              controls
            />
          </Box>
          <Container maxWidth='xl' sx={{ background: '#22272D', borderRadius: 2, p: 2, mt: 5, mb: 2 }}>
            <Box mb={1} ml={1}>
              <FormGroup sx={{ display: 'inline-block' }}>
                <FormControlLabel control={<Switch checked={this.state.playEnabled} onChange={this.handlePlayChange} />} label="Autoplay" />
              </FormGroup>
              <FormGroup sx={{ display: 'inline-block' }}>
                <FormControlLabel control={<Switch checked={this.state.clipsEnabled} onChange={this.handleClipChange} />} label="Enable Clips" />
              </FormGroup>
            </Box>
            <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', gap: 2, p: 0 }}>
              {this.state.queuedClips.map((queue, i) => (
                <Paper key={i} sx={{ backgroundImage: `url(${queue.image})`, backgroundSize: 'cover', border: '1px solid #4B5057', height: 93, aspectRatio: '16 / 9', padding: 0 }} onMouseEnter={e => this.handleShowControls(e, true)} onMouseLeave={e => this.handleShowControls(e, false)}>
                  <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.75);', width: '100%', height: '100%', position: 'relative', display: 'none', justifyContent: 'space-between', alignItems: 'flex-end' }} >
                    <IconButton aria-label="play" color="info" size="small" sx={{ justifySelf: 'flex-start' }} onClick={e => this.handlePlayButton(e, queue)}><PlayCircle sx={{ fontSize: '1.3rem' }} /></IconButton>
                    <IconButton aria-label="remove" color="error" size="small" sx={{ justifySelf: 'flex-end' }} onClick={e => this.handleSkipButton(e, queue)}><RemoveCircle sx={{ fontSize: '1.3rem' }} /></IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Container>
        </Paper>
      </Container>
    );
  }

}

function withParams(Component) {
  return props => <Component {...props} params={useParams()} />;
}

export default withParams(App);
