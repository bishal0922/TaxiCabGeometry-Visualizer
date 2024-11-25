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
      title: 'Taxicab Geometry',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-600">Math 3301</h2>
            <h3 className="text-lg font-medium text-gray-500">Bishal Giri</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                Taxicab geometry was introduced by Hermann Minkowski, a German mathematician, 
                in the 19th century. It presents an alternative way of measuring distances 
                that better reflects real-world urban movement.
              </p>
              <p className="text-lg leading-relaxed">
                Unlike traditional geometry where we measure straight-line distances, 
                taxicab geometry measures distance as the sum of horizontal and vertical 
                movements - just like how we navigate through city streets.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <img 
                src="https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcTGjXQ3CoRagGgLNSMmHQuRUFq8NypkBtPaB55cAl9HXkhcopFhnOxZo8jhh1mSzDk_U0z7iRJ-YrLunaM"
                alt="Hermann Minkowski"
                className="rounded-lg shadow-lg max-w-[300px]"
              />
              <p className="text-sm text-gray-600 italic">Hermann Minkowski (1864-1909)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'comparison',
      title: 'Understanding the Difference',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-600">Euclidean Geometry</h3>
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                <p className="font-mono text-lg mb-4">dE(P, Q) = √[(x₂ - x₁)² + (y₂ - y₁)²]</p>
                <ul className="space-y-2">
                  <li>• Measures the shortest possible path between two points</li>
                  <li>• Like a bird flying directly to its destination</li>
                  <li>• The familiar "as the crow flies" distance</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-red-600">Taxicab Geometry</h3>
              <div className="p-6 bg-red-50 rounded-lg border border-red-100">
                <p className="font-mono text-lg mb-4">dT(P, Q) = |x₂ - x₁| + |y₂ - y₁|</p>
                <ul className="space-y-2">
                  <li>• Measures distance along horizontal and vertical paths</li>
                  <li>• Like a taxi navigating city blocks</li>
                  <li>• Reflects real-world urban movement constraints</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Key Differences:</h3>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Path Options:</span> While Euclidean geometry allows movement in any direction,
                taxicab geometry restricts movement to horizontal and vertical paths, mimicking city street layouts.
              </p>
              <p>
                <span className="font-semibold">Distance Calculation:</span> Taxicab distance is always greater than or equal to 
                Euclidean distance. They're equal only when points align perfectly horizontally or vertically.
              </p>
              <p>
                <span className="font-semibold">Real-World Application:</span> The polling station problem demonstrates how 
                taxicab geometry better models real-world scenarios where movement is restricted by urban infrastructure.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'applications',
      title: 'Real-World Applications',
      content: (
        <div className="space-y-6">
          <p className="text-lg">
            Taxicab geometry helps solve real-world problems where movement is restricted to paths along a grid:
          </p>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-3">Emergency Services</h3>
                <p>
                  Helps position ambulance stations and fire stations to minimize response 
                  time when vehicles must follow city streets.
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-3">School Bus Routes</h3>
                <p>
                  Plans efficient routes for school buses that must navigate through city 
                  blocks to pick up students.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-3">Polling Stations</h3>
                <p>
                  Determines the best locations for voting centers to minimize the walking 
                  distance for all residents in a neighborhood.
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-3">Delivery Services</h3>
                <p>
                  Helps delivery companies plan routes and estimate delivery times when 
                  drivers must follow street patterns.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg mt-4">
            <p className="text-sm">
              In all these cases, taxicab geometry provides more accurate distance calculations 
              than Euclidean geometry because it accounts for the actual paths people and 
              vehicles must take.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'explorer',
      title: 'Interactive Explorer',
      content: (
        <div>
          <p className="text-lg mb-6">
            Use this interactive tool to explore how distances differ between taxicab and 
            Euclidean geometry. Try moving the start and end points to see how the paths 
            and distances change!
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