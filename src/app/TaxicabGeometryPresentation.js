import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GeometryExplorer from './GeometryExplorer/page';

const TaxicabGeometryPresentation = () => {
  const [currentSection, setCurrentSection] = useState(0);
  
  const sections = [
    {
      id: 'intro',
      title: 'What is Taxicab Geometry?',
      content: (
        <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-600">Math 3301</h2>
          <h3 className="text-lg font-medium text-gray-500">Bishal Giri</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Introduction</h3>
            <p className="text-lg leading-relaxed">
              Imagine you&apos;re driving a taxi in a city. You can&apos;t drive through buildings - you have to follow the streets. 
              This is exactly what taxicab geometry is about! It measures distances the way a car would actually drive through 
              city streets, not as the crow flies.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">How Do We Calculate Distance?</h3>
            <p className="text-lg leading-relaxed">
              In normal (Euclidean) geometry, we measure straight-line distance. But in taxicab geometry, we add up 
              the total blocks we need to travel horizontally and vertically.
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold mb-2">Simple Example:</p>
              <p>Let&apos;s say you want to go from Point A(0,0) to Point B(3,2):</p>
              <p>• You need to go right 3 blocks: 3 units</p>
              <p>• You need to go up 2 blocks: 2 units</p>
              <p>• Total distance = 3 + 2 = 5 blocks</p>
            </div>
          </div>
          
          <div>
            <svg viewBox="0 0 200 200" className="w-full h-auto border rounded-lg shadow-sm bg-white p-4">
              {[...Array(8)].map((_, i) => (
                <React.Fragment key={i}>
                  <line 
                    x1={25 * i + 25} y1="25" x2={25 * i + 25} y2="175"
                    stroke="#eee" strokeWidth="1"
                  />
                  <line 
                    x1="25" y1={25 * i + 25} x2="175" y2={25 * i + 25}
                    stroke="#eee" strokeWidth="1"
                  />
                </React.Fragment>
              ))}
              
              <path
                d="M 50 150 L 50 50 L 150 50"
                stroke="blue"
                strokeWidth="2"
                fill="none"
              />
              <text x="80" y="45" fill="blue" fontSize="12">Street Route</text>
              
              <line
                x1="50" y1="150"
                x2="150" y2="50"
                stroke="red"
                strokeWidth="2"
              />
              <text x="70" y="120" fill="red" fontSize="12">Direct Route</text>
              
              <circle cx="50" cy="150" r="4" fill="black" />
              <text x="40" y="165" fontSize="12">Start</text>
              
              <circle cx="150" cy="50" r="4" fill="black" />
              <text x="160" y="55" fontSize="12">End</text>
            </svg>
          </div>
        </div>
      </div>
      )
    },
    {
        id: 'comparison',
        title: 'Taxicab vs Regular Distance',
        content: (
            <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">Understanding the Formulas</h3>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Taxicab Distance</h4>
              <div className="font-mono text-lg mb-2">
                dT = |x₂ - x₁| + |y₂ - y₁|
              </div>
              <p className="text-sm">
                We add the absolute horizontal and vertical distances
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Euclidean (Regular) Distance</h4>
              <div className="font-mono text-lg mb-2">
                dE = √[(x₂ - x₁)² + (y₂ - y₁)²]
              </div>
              <p className="text-sm">
                We use the Pythagorean theorem for straight-line distance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-4">Example 1: Diagonal Path</h4>
            
            <svg viewBox="0 0 200 200" className="w-full h-48 mb-4">
              {/* Grid */}
              {[...Array(6)].map((_, i) => (
                <React.Fragment key={i}>
                  <line 
                    x1={40 * i + 20} y1="20" x2={40 * i + 20} y2="180"
                    stroke="#eee" strokeWidth="1"
                  />
                  <line 
                    x1="20" y1={40 * i + 20} x2="180" y2={40 * i + 20}
                    stroke="#eee" strokeWidth="1"
                  />
                </React.Fragment>
              ))}
              
              {/* Paths */}
              <path
                d="M 60 140 L 60 60 L 140 60"
                stroke="blue"
                strokeWidth="2"
                fill="none"
              />
              <line
                x1="60" y1="140"
                x2="140" y2="60"
                stroke="red"
                strokeWidth="2"
              />
              
              {/* Points */}
              <circle cx="60" cy="140" r="4" fill="black" />
              <text x="45" y="155" fontSize="12">A(1,1)</text>
              
              <circle cx="140" cy="60" r="4" fill="black" />
              <text x="145" y="55" fontSize="12">B(4,4)</text>
            </svg>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-semibold">Taxicab Distance:</p>
                <div className="pl-4 space-y-1 font-mono">
                  <p>dT = |x₂ - x₁| + |y₂ - y₁|</p>
                  <p>dT = |4 - 1| + |4 - 1|</p>
                  <p>dT = 3 + 3 = 6 units</p>
                </div>
              </div>
              
              <div className="bg-red-50 p-3 rounded">
                <p className="font-semibold">Euclidean Distance:</p>
                <div className="pl-4 space-y-1 font-mono">
                  <p>dE = √[(4-1)² + (4-1)²]</p>
                  <p>dE = √[9 + 9]</p>
                  <p>dE = √18 ≈ 4.24 units</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold mb-4">Example 2: Straight Path</h4>
            
            <svg viewBox="0 0 200 200" className="w-full h-48 mb-4">
              {/* Grid */}
              {[...Array(6)].map((_, i) => (
                <React.Fragment key={i}>
                  <line 
                    x1={40 * i + 20} y1="20" x2={40 * i + 20} y2="180"
                    stroke="#eee" strokeWidth="1"
                  />
                  <line 
                    x1="20" y1={40 * i + 20} x2="180" y2={40 * i + 20}
                    stroke="#eee" strokeWidth="1"
                  />
                </React.Fragment>
              ))}
              
              {/* Path */}
              <line
                x1="60" y1="100"
                x2="140" y2="100"
                stroke="purple"
                strokeWidth="2"
              />
              
              {/* Points */}
              <circle cx="60" cy="100" r="4" fill="black" />
              <text x="45" y="115" fontSize="12">A(1,3)</text>
              
              <circle cx="140" cy="100" r="4" fill="black" />
              <text x="145" y="115" fontSize="12">B(4,3)</text>
            </svg>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-semibold">Taxicab Distance:</p>
                <div className="pl-4 space-y-1 font-mono">
                  <p>dT = |x₂ - x₁| + |y₂ - y₁|</p>
                  <p>dT = |4 - 1| + |3 - 3|</p>
                  <p>dT = 3 + 0 = 3 units</p>
                </div>
              </div>
              
              <div className="bg-red-50 p-3 rounded">
                <p className="font-semibold">Euclidean Distance:</p>
                <div className="pl-4 space-y-1 font-mono">
                  <p>dE = √[(4-1)² + (3-3)²]</p>
                  <p>dE = √[9 + 0]</p>
                  <p>dE = 3 units</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold mb-3">Important Properties</h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold mb-2">When are they different?</h5>
            <ul className="list-disc pl-6 space-y-2">
              <li>When moving diagonally</li>
              <li>Taxicab distance is always equal to or larger</li>
              <li>Biggest difference occurs at 45° angles</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">When are they the same?</h5>
            <ul className="list-disc pl-6 space-y-2">
              <li>When moving only horizontally</li>
              <li>When moving only vertically</li>
              <li>When no diagonal movement is needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
        )
      },
   
    {
        id: 'polling-example',
        title: 'Solving a Real Problem: Where to Put Voting Stations?',
        content: (
            <div className="space-y-8">
            {/* Introduction Card */}
            <Card>
              <CardContent className="p-6">
                <p className="text-lg text-gray-700">
                  Imagine you&apos;re in charge of setting up voting stations in a small town. You need to place them 
                  so everyone can reach a station easily by walking along the streets.
                </p>
              </CardContent>
            </Card>
      
            <div className="grid md:grid-cols-2 gap-6">
              {/* Setup Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">The Setup</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Buildings</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-700">Lower Area:</h5>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>A at (1,1)</li>
                            <li>B at (4,1)</li>
                            <li>C at (2,3)</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700">Upper Area:</h5>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>D at (5,3)</li>
                            <li>E at (1,5)</li>
                            <li>F at (4,5)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
      
                    <div>
                      <h4 className="font-semibold">Constraints</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Can only set up 2 stations</li>
                        <li>People must walk along streets</li>
                        <li>Want to minimize walking distance</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
      
              {/* Solution Visualization */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Our Solution</h3>
                  <svg viewBox="0 0 200 200" className="w-full mb-4">
                    {/* Grid */}
                    {[...Array(6)].map((_, i) => (
                      <React.Fragment key={i}>
                        <line 
                          x1={33.3 * i + 33.3} y1="33.3" x2={33.3 * i + 33.3} y2="166.7"
                          stroke="#eee" strokeWidth="1"
                        />
                        <line 
                          x1="33.3" y1={33.3 * i + 33.3} x2="166.7" y2={33.3 * i + 33.3}
                          stroke="#eee" strokeWidth="1"
                        />
                      </React.Fragment>
                    ))}
                    
                    {/* Buildings */}
                    <circle cx="50" cy="150" r="4" fill="#4B5563" />
                    <circle cx="150" cy="150" r="4" fill="#4B5563" />
                    <circle cx="50" cy="100" r="4" fill="#4B5563" />
                    <circle cx="150" cy="100" r="4" fill="#4B5563" />
                    <circle cx="50" cy="50" r="4" fill="#4B5563" />
                    <circle cx="150" cy="50" r="4" fill="#4B5563" />
                    
                    {/* Polling Stations */}
                    <circle cx="100" cy="125" r="6" fill="#EF4444" />
                    <circle cx="100" cy="75" r="6" fill="#EF4444" />
                  </svg>
                  
                  <div className="text-sm text-gray-600">
                    • Gray dots: Buildings
                    <br />
                    • Red dots: Polling stations
                  </div>
                </CardContent>
              </Card>
            </div>
      
            {/* Results */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Results</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Walking Distances to Station 1:</h4>
                    <ul className="space-y-1">
                      <li>From Building A: 3 blocks</li>
                      <li>From Building B: 2 blocks</li>
                      <li>From Building C: 2 blocks</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Walking Distances to Station 2:</h4>
                    <ul className="space-y-1">
                      <li>From Building D: 3 blocks</li>
                      <li>From Building E: 3 blocks</li>
                      <li>From Building F: 2 blocks</li>
                    </ul>
                  </div>
                </div>
      
                <div className="mt-6 bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Why This Works Well:</h4>
                  <ul className="space-y-2">
                    <li>• Maximum walking distance is only 3 blocks</li>
                    <li>• Each station serves 3 buildings evenly</li>
                    <li>• Stations are at easy-to-find street intersections</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      },
      {
        id: 'realworld',
        title: 'Why Is This Useful?',
        content: (
          <div className="space-y-6">
            <p className="text-lg">Think about these everyday situations:</p>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                  <h3 className="font-semibold text-lg mb-3">Walking to School</h3>
                  <p>
                    When you walk to school, you follow sidewalks and streets. You can't walk 
                    straight through buildings. Taxicab geometry helps plan the best route.
                  </p>
                </div>
                
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                  <h3 className="font-semibold text-lg mb-3">Pizza Delivery</h3>
                  <p>
                    Pizza delivery drivers need to know real driving distances, not straight-line 
                    distances. This helps them plan faster routes.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                  <h3 className="font-semibold text-lg mb-3">Finding Polling Stations</h3>
                  <p>
                    When cities plan where to put voting stations, they need to know real walking 
                    distances for everyone in the neighborhood.
                  </p>
                </div>
                
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                  <h3 className="font-semibold text-lg mb-3">Emergency Services</h3>
                  <p>
                    Ambulances and fire trucks need to know actual driving distances to reach 
                    people quickly in emergencies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      },
    {
      id: 'explorer',
      title: 'Try It Yourself!',
      content: (
        <div>
          <p className="text-lg mb-6">
            Move the points around to see how taxicab distance compares to straight-line distance!
          </p>
          <GeometryExplorer />
        </div>
      )
    }
  ];

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(curr => curr + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(curr => curr - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  {sections[currentSection].title}
                </h2>
                {sections[currentSection].content}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={prevSection}
            disabled={currentSection === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="flex gap-2">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  currentSection === index ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            onClick={nextSection}
            disabled={currentSection === sections.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaxicabGeometryPresentation;