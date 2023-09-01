
p5.disableFriendlyErrors = true; // disables FES

var prime ;
var count ;
var kaleiPrime ;
var kaleiNum ;

var multiK;
var indK; //for testing of ind lin

//for play/pause
var playBool;

//for saving Image
var saveBool;

var bgCanvas;

var boundary;

var reverseBool;
var reversing;


function setup() {

  mainCanvas = createCanvas( windowWidth , windowHeight , P2D );

  angleMode(RADIANS);
  boundary = displayHeight; //the boundary is the shorter side of the canvas dimensions
  colorMode( HSB , 360 ,  100 , 100 );
  // angleMode( DEGREES );
  frameRate( 20 );


  saveBool = false;

  playBool = true;

  reverseBool = false;
  reversing = false; 

  resetPatterns();

  // prime = [ 2 , 3 , 5 , 7 ];
  // count = round(  ( 2 , 3 ) );
  // kaleiPrime = prime [ round( random ( 3 ) ) ];
  // kaleiNum = count;

  // // print( kaleiPrime , kaleiNum );

  // // constructor( prime , num , swMax , swMin ){
  // multiK = new linGroup ( kaleiPrime , 1 , 20 , 3 );
  // multiK.compute();

  // // indK = new lin ( 4 , 20 , 100 , 3 , 10 , 2 );
  // // constructor( maxCurl , maxSpeed , size , sides , strokeMax , strokeMin ) {

  // print (multiK.group);
  // multiK.compute();

}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  
  clear();
  fullscreen( true );
  background(0);

  translate( width/2 , height/2 );

  // print( multiK.group.length );
  
  // for updating
  if ( playBool ){
    // print( "playing" );

    for ( let indKalei of multiK.group ){

      indKalei.update();

    }
    //   indK.continueUpdate();
    //   reversing = false;
    // }
    
    // indK.update();

  }

  // for displaying
  for ( let indKalei of multiK.group ){
    
    indKalei.display();

  }

  // for saving
  if( saveBool === true ){
    
    saveImg( multiK );
    saveBool = false ;

  }
  
}

class linGroup{

  constructor( prime , num , swMax , swMin ){
 
    this.prime = prime ;
    this.num = num ;

    this.group = [] ;
    this.constant = this.prime * this.num;

    this.swMax = swMax ; 
    this.swMin = swMin ;

  }

  compute(){

    let sidesVal;
    let sizeVal;
    let speed;
    let curl;

    let sMax ;
    let sMin ;

    for ( let i = 0 ; i < this.num ; i ++ ){

      sidesVal = round( random ( 1 , 3 ) ) * this.prime ;
      sizeVal = round( 500 / ( this.num * sidesVal )) ;
      speed = round ( random (10 , 30 ) );
      curl = round( random( PI/8 -0.1 , PI/8 + 0.1 ) ); 
      
      sMax = this.swMax + random ( -1 , 1 );
      sMin = this.swMin + random ( -0.1 , 0.1 );

      this.group.push( new lin(  PI/8 ,  speed , sizeVal , sidesVal , 10 ,  0.5 ,  1000 ) ) ;

    }
  }

  copyGraphics( graphic ){

    for( let i = 0 ; i < this.num ; i++ ){

      this.group[i].repeatDisplay( graphic );
    }

  }
}

class perlin {
  constructor( name , seed, theta = random(TWO_PI) , step = 0.01 , counts = 1000 , lod = 4 , falloff = 0.5, x=random(10) , y=random(10)  ) {
    
    this.name = name ; 
    this.seed = seed;
    this.theta = theta;
    this.step = step ;  // step = r* theta 
    this.counts = counts; // total number of steps in 1 perlin loop

    this.lod = lod;
    this.falloff = falloff;

    this.alpha = TWO_PI/this.counts;
    this.r = this.step/this.alpha ; 

    this.x = random(10);

    this.origin = createVector( x , y );
  }

  next(){
    this.x += this.step;
    this.theta += TWO_PI/this.counts;
  }

  get value(){
    
    push() ; 
    noiseSeed(this.seed);
    noiseDetail( this.lod, this.falloff );

    let value = noise(this.x);

    pop();

    return value ; 
  }

}

class polar{
  constructor( radius , theta ){
    this.r = radius ; 
    this.theta = theta ;
  }

  value( ){
    
    let vel = createVector( this.r * cos( this.theta ) , this.r * sin( this.theta ) );
    return vel;

  }
}

function distSquared(x1, y1, x2, y2) {
  let dx = abs(x2 - x1);
  let dy = abs(y2 - y1);
  let ret = sqrt( dx * dx + dy * dy );

  return sqrt( dx * dx + dy * dy );
}


class lin {

  constructor( maxCurl , maxSpeed , size , sides , strokeMax , strokeMin , steps , fluct = 5 , order = 0.6) {

    // this.keyVel = createVector( 0 , 0 );

    // maxSpeed = 30; 
    this.maxCurl = maxCurl;
    this.maxSpeed = maxSpeed ;
    this.size = size ;
    this.sides = sides; 

    this.strokeMax = strokeMax ;
    this.strokeMin = strokeMin ;

    this.steps = steps ;

    this.trail = [] ; 
    this.vel = new polar ( 0 , 0 );

    this.noiseRad = new perlin( 
      'noiseRad',
      random(100),
      random(10),
      0.2 ,
      this.steps , 
      fluct , // more octaves/fluct , more fluctuation in velcities, default value is 5
      0.5 // 
    );

    this.noiseTheta = new perlin( 
       'noiseTheta', //name
       random(100), //seed 
       random(10), //step 
       0.2 , // counts 
       this.steps , 
       4 , // lod
       order //  order referring to the falloff level of the curves
       // more order/falloff , more persistence in the curves (more circles)
    );


    this.cHSB = []; 

    this.noiseHue = new perlin(
      'noiseHue',
      random( 100 ),
      random( 10 )
    );

    this.noiseSat = new perlin(
      'noiseSat',
      random( 100 ),
      random( 10 )
    );

    this.noiseBright = new perlin(
      'noiseBright',
      random( 100 ),
      random( 10 )
    );
    
    let bound = 1/sqrt(2) * boundary/2 ; 
    this.o_pos = createVector( random( - bound , bound ) , random( -bound, bound ) ); //random start position
    //this.pos is the independent position value that syncs with trail[0] after each iteration
    this.pos = this.o_pos.copy(); 

    //this.hueVal and this.cVal is the independent color value that syncs with cHSB[0] after each iteration
    this.hueVal = random(360) ;//random hue value at the start
    this.cVal = color ( this.hueVal , 0 , 0 );

    this.trailMemory = [] ; 
    this.cHSBMemory = [];
    this.memorySize = 1000;
    this.colormemorySize = this.memorySize * 4 ; //coz max inverse_speed = 4, each iteration of update() adds a max of 4 color values into cHSBMemory

    this.reverseCount = 0 ;
    this.reverseColorCount = 0 ;

    this.inverse_speed = [] ; // first value is for syncing of colors when this.vel is low
    // array size is equal to memmory size, to save past inver_speed values to tally with inverseColorCount

  }

  update(){

    push();

    // noiseSeed( this.noiseRad.seed );
    this.vel.r = map( this.noiseRad.value , 0 , 1 , 0 , this.maxSpeed );
    
    print( "velocity");
    print( this.noiseRad.value );
    print( this.vel.r );

    pop();

    // print( this.vel.r );
  
    push();

    // noiseSeed( this.noiseTheta.seed );  
    // the curl depends on the velocity, the higher the velocity, the lesser it will turn, and vice versa
    
    let curl = map( this.vel.r , 0 , this.maxSpeed , this.maxCurl , this.maxCurl * 1/2 );

    let thetaChange = map( this.noiseTheta.value , 0 , 1 , -curl , curl  );
    // let thetaChange = random ( 20 );
    // print( thetaChange );
    this.vel.theta += thetaChange;


    pop();

    if ( this.vel.theta > TWO_PI ){
      this.vel.theta -= TWO_PI;
    }
  
    else if ( this.vel.thera < 0 ){
      this.vel.theta += TWO_PI ; 
    }
    
    // update position
    this.pos.add( this.vel.value() ); // returns cartesian vector coordianates of vel which is initialized in polar

    //check boundary
    if ( this.pos.x < - (1/sqrt(2) * boundary/2) || this.pos.x > (1/sqrt(2) * boundary/2) ){

      let s = this.pos.copy();
      this.pos.x = - s.x + 2 * ( s.x % (1/sqrt(2) * boundary/2) ); 

    }

    if ( this.pos.y < - (1/sqrt(2) * boundary/2) || this.pos.y > (1/sqrt(2) * boundary/2) ){


      let s = this.pos.copy();
      this.pos.y = - s.y + 2 * ( s.y % (1/sqrt(2) * boundary/2) ); 

    }

    // update trail
    this.trail.unshift( this.pos.copy() );// adds new positon to start of trail
    if ( this.trail.length > this.size ){//removes last element when traul length exceeds size

      this.trail.pop();

    }


    //update trainMemory
    this.trailMemory.unshift( this.pos.copy() );
    if ( this.trailMemory.length > this.memorySize ){//removes last element when traul length exceeds size

      this.trailMemory.pop();

    }
    
    this.noiseRad.next();
    this.noiseTheta.next();

    this.plotColours();

  }

  display(){

    // fill(cHSB[0]);
    // circle ( trail[0].x , trail[0].y , 20 );

    // print( this.strokeMax );
  
    if ( this.trail.length > 0 ) {
      let d ;
      let sw; 
      for( let i = 0 ; i < this.trail.length-1 ; i ++  ){
  
        d = distSquared( this.trail[i].x , this.trail[i].y , this.trail[i+1].x , this.trail[i+1].y);
        // print(d);
        // if ( d < 0 ){
        //   print("negative");
        // } 
        sw = map( d , 0 ,  this.maxSpeed , this.strokeMax , this.strokeMin ) ;
        // print( "stroke weight")
        // print( d )
        // print( sw );

      
        if ( d < boundary/2 ){
          if ( sw < 0 ){
            // print("negative");
          }
          // print(d);
          
          stroke( this.cHSB[i] );
          
          // stroke( 255 );
          strokeWeight( sw );
          // line( this.trail[i].x , this.trail[i].y , this.trail[i+1].x , this.trail[i+1].y );
          for ( let n = 0 ; n < this.sides ; n ++ ){

            push();

              rotate( n * 2 * PI /this.sides );
              line( this.trail[i].x , this.trail[i].y , this.trail[i+1].x , this.trail[i+1].y );
              push();
      
                scale( -1 , 1 );
                line( this.trail[i].x , this.trail[i].y , this.trail[i+1].x , this.trail[i+1].y );
      
              pop();
              
            pop();
      
          }
        }
    
      }
    }
  

  } 

  plotColours(){

    this.inverse_speed.unshift( round ( this.maxSpeed / this.vel.value().mag() ) )  ; 
    
    if ( this.inverse_speed.length > this.memorySize ){

      this.inverse_speed.pop();

    } 

    if (this.inverse_speed[0] == null ){
      this.inverse_speed[0] = 1;
    }

    if ( this.inverse_speed[0] == 0 ){
      this.inverse_speed[0] = 1 ;
    }
    
    if ( this.inverse_speed[0] > 4 ){
      this.inverse_speed[0] = 4;
    }



    for ( let i = 0 ; i < this.inverse_speed[0] ; i ++ ){

      // push();
      // noiseSeed( this.noiseHue.seed );
      let hueChange = map( this.noiseHue.value , 0 , 1 , -5 , 5 );
      // pop();
    
    
      this.hueVal += hueChange ; 
    
      // print( hueChange );
    
      if ( this.hueVal > 360 ){
        this.hueVal -= 360;
      }
      else if ( this.hueVal < 0 ){
        this.hueVal += 360;
      }
    
      // print(hueVal);
    
      // push();
      // noiseSeed( this.noiseSat.seed );
      let satVal = map( this.noiseSat.value , 0 , 1 , 70 , 100 );
      // pop();
    
      // push();
      // noiseSeed( this.noiseBright.seed );
      let brightVal = map( this.noiseBright.value , 0 , 1 , 70 , 100 );
      // pop();

      // print( color( this.hueVal , satVal , brightVal ) ) ; 
      this.cVal = color( this.hueVal , satVal , brightVal ); //new color value
  
      this.cHSB.unshift( this.cVal );
    
      if ( this.cHSB.length > this.size ){
        this.cHSB.pop();
      }
  
      this.cHSBMemory.unshift( this.cVal );
  
      if ( this.cHSBMemory.length > this.colormemorySize ){
        this.cHSBMemory.pop();
      }
    
      // for( let i = colorVal.length -1 ; i > 0 ; i --  ){
    
      //   colorVal[i] = colorVal[i-1];
      // }
      this.noiseHue.next();
      this.noiseSat.next();
      this.noiseBright.next();

    }
  
  

  
  }
  
}

function keyPressed(){

  if ( keyCode === 32 ){//SPACE 

    playBool = !playBool;

  }

  else if ( keyCode === 13 ) {//ENTER

    saveBool = true ; 
    

  }

  else if ( keyCode == 81 ){ //Q

    resetPatterns();
    playBool = true ; 

  }

}

function saveImg(){

  save( mainCanvas , "Perlin Kaleidoscope"  );

}


function resetPatterns (){

  prime = [ 2 , 3 , 5 , 7 ];
  count = round(  ( 2 , 3 ) );
  kaleiPrime = prime [ round( random ( 3 ) ) ];
  kaleiNum = count;

  // print( kaleiPrime , kaleiNum );

  // constructor( prime , num , swMax , swMin ){
  multiK = new linGroup ( kaleiPrime , kaleiNum , 10 , 0.5 );
  multiK.compute();

  // indK = new lin ( 4 , 20 , 100 , 3 , 10 , 2 );
  // constructor( maxCurl , maxSpeed , size , sides , strokeMax , strokeMin ) {

  // print (multiK.group); 
  // multiK.compute();

}