import React, { Component } from 'react';
import PropTypes from 'prop-types';
//import logo from './logo.svg';
// CSS
import './css/normalize.css';
import './css/App.css';
// Components
import Navigation from './components/Navigation.js';
import ImageList from './components/ImageList.js';
import Lightbox from './components/Lightbox.js';
 
class App extends Component {
  constructor(props){
    super(props);  
  
    // Country list
    this.countries = this.props.countries;
    if (this.countries.length > 1) this.countries.unshift('All');
    
    // Photos
    this.dataImages = this.props.images
    this.batch = 20;

    // State init
    this.state = {
      currentCountry: 'All',
      currentCity: 'All',
      currentImageList: this.dataImages,
      lightbox: false,
      currentIndex: 0,
      maxIndex: this.batch - 1
    }
  }

  // Methods

  lazyLoad = () => {

    const images = this.state.currentImageList
                    .filter((img,index) => {
                      return index <= this.state.maxIndex;
                    });
    return images;
  }
  
  loadImages = (e) => {
    const left = this.state.currentImageList.length - (this.state.maxIndex+1);
    const load = left >= this.batch ? this.batch : left;
    this.setState({
      maxIndex: this.state.maxIndex + load
    })
  }

  

  /**************************************/
  /* Image List */
  /**************************************/

  // getCityList()
  // Get city list of the current country
  getCityList = () => {
    if (this.state.currentCountry === 'All') return;

    const countryImages = this.dataImages.filter(img => img.country === this.state.currentCountry);
    
    let cities = countryImages.reduce((acc,next) => {
      acc.push(next.city);
      return acc;
    },[]);
    // Remove duplicates
    cities = Array.from(new Set(cities));
    // If more than 1 city, add 'All' option
    if (cities.length > 1) cities.unshift('All');

    return cities;
  }

  // filterByCountry()
  // Updates currentCountry state
  // Updates currentImageList state with array of images filtered by country. Filter from all images (dataImages)
  // Reset currentCity state
  filterByCountry = country =>{
    let filteredImages;
    if (country !== 'All'){
      filteredImages = this.dataImages.filter(img => img.country === country);
    }
    else{
      filteredImages = this.dataImages;
    }
    this.setState({
      currentCountry: country,
      currentCity:'All',
      currentImageList: filteredImages,
      maxIndex: this.batch - 1
    });
  }
  
  // filterByCity()
  //  Updates currentCity state
  // Updates currentImageList state with array of images filtered by country and city
  filterByCity = city =>{
    // Filter by country
    let filteredImages = this.dataImages.filter(img => img.country === this.state.currentCountry);
  
    if (city !== 'All'){
      // Filter by city
      filteredImages = filteredImages.filter(img => img.city === city ); 
    }

    this.setState({
      currentCity: city,
      currentImageList: filteredImages,
      maxIndex: this.batch - 1
    }); 
  }

  /**************************************/
  /* Lightbox */
  /**************************************/
  openLightbox = (index) => { // number
    this.setState({
      lightbox: true,
      currentIndex: index
    });
  }

  closeLightbox = () => {
    let lastImg = document.querySelector(`a[data-current-index="${this.state.currentIndex}"]`);
    if (lastImg) lastImg.focus();
    this.setState({
      lightbox: false
    });
  }

  navigateLightbox = (next) => { // boolean
    const leftImages = this.state.currentImageList.length - (this.state.maxIndex+1);
    let oldIndex = this.state.currentIndex;
    let newIndex;
    const lastIndex = leftImages > 0 ? this.state.maxIndex : this.state.currentImageList.length-1;    
    // next image
    if (next){ 
      if (oldIndex !== lastIndex)  newIndex = oldIndex + 1;       
      // if last img, go to the first
      else newIndex = 0;
    }
    // previous image
    else {
      if (oldIndex !== 0) newIndex = oldIndex - 1;
      // if first img, go to the last
      else newIndex = lastIndex;
    }
    
    if (!(oldIndex === newIndex)){
      this.setState({
        currentIndex: newIndex
      });
    }

  }

  /**************************************/
  /* Render */
  /**************************************/
  render() {
    const lightboxProps = {
      image: this.state.currentImageList[this.state.currentIndex],
      onExit: this.closeLightbox,
      onNav: this.navigateLightbox
    }

    const leftImages = this.state.currentImageList.length - (this.state.maxIndex+1);
  
    return (
        <div>
          <nav className="country-list">
            <Navigation 
              places={this.countries}
              clickHandler={this.filterByCountry} 
              currentPlace={this.state.currentCountry}/>
          </nav>
          <nav className="city-list">
            <Navigation 
              places={this.state.currentCountry === 'All' ? [] : this.getCityList()}
              clickHandler={this.filterByCity} 
              currentPlace={this.state.currentCity}/>
          </nav>
          <main className='main'>
            <ImageList 
              images={this.lazyLoad()} 
              mapNavigation={this.filterByCountry}
              clickHandler={this.openLightbox} 
              currentCountry={this.state.currentCountry}/>
              <div className="pagination">
                <p>{leftImages > 0 ? this.state.currentImageList.length - leftImages : this.state.currentImageList.length} / {this.state.currentImageList.length}</p>
                {leftImages > 0 ? <button className="btn load-btn" onClick={this.loadImages}>See more</button> : null}
            </div> 
          </main>       
          {this.state.lightbox ? <Lightbox  {...lightboxProps}/> : null }
        </div>
    )
  }
}

App.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.string),
  dataImages: PropTypes.arrayOf(PropTypes.object)
};

export default App;
