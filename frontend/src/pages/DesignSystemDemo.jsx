import React, { useState } from 'react';
import { Button, Card, Input, Badge, StatCardSkeleton } from '../components/ui';
import { theme } from '../constants/theme';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaUser } from 'react-icons/fa';

/**
 * Design System Demo Page
 * Showcases all UI components with examples
 * Use this as a reference while building other pages
 */
const DesignSystemDemo = () => {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [errorInput, setErrorInput] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className={theme.spacing.container}>
        <div className="mb-8">
          <h1 className={theme.typography.h1}>Design System Components</h1>
          <p className={theme.typography.body}>
            All components are GPU-accelerated and optimized for 60fps performance
          </p>
        </div>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className={theme.typography.h2 + ' mb-6'}>Buttons</h2>
          <div className={theme.spacing.grid3}>
            <Card>
              <h3 className={theme.typography.h4 + ' mb-4'}>Primary Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="warning">Warning</Button>
              </div>
            </Card>

            <Card>
              <h3 className={theme.typography.h4 + ' mb-4'}>With Icons</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" leftIcon={<FaPlus />}>
                  Add New
                </Button>
                <Button variant="danger" leftIcon={<FaTrash />}>
                  Delete
                </Button>
                <Button variant="secondary" rightIcon={<FaEdit />}>
                  Edit
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className={theme.typography.h4 + ' mb-4'}>States</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" loading>
                  Loading...
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
                <Button variant="icon">
                  <FaSearch />
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className={theme.typography.h2 + ' mb-6'}>Cards</h2>
          <div className={theme.spacing.grid3}>
            <Card variant="default">
              <h3 className={theme.typography.h4}>Default Card</h3>
              <p className={theme.typography.body}>
                Standard card with shadow and border
              </p>
            </Card>

            <Card variant="elevated">
              <h3 className={theme.typography.h4}>Elevated Card</h3>
              <p className={theme.typography.body}>
                Enhanced shadow for emphasis
              </p>
            </Card>

            <Card variant="interactive">
              <h3 className={theme.typography.h4}>Interactive Card</h3>
              <p className={theme.typography.body}>
                Hover me! Scales on hover with pointer cursor
              </p>
            </Card>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="mb-12">
          <h2 className={theme.typography.h2 + ' mb-6'}>Form Inputs</h2>
          <div className={theme.spacing.grid2}>
            <Card>
              <h3 className={theme.typography.h4 + ' mb-4'}>Standard Input</h3>
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                required
                helperText="We'll never share your email"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </Card>

            <Card>
              <h3 className={theme.typography.h4 + ' mb-4'}>With Icons</h3>
              <Input
                label="Search"
                type="text"
                placeholder="Search..."
                leftIcon={<FaSearch />}
              />
              <div className="mt-4">
                <Input
                  label="Username"
                  type="text"
                  placeholder="Enter username"
                  rightIcon={<FaUser />}
                />
              </div>
            </Card>

            <Card>
              <h3 className={theme.typography.h4 + ' mb-4'}>Error State</h3>
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                error="Password must be at least 8 characters"
                value={errorInput}
                onChange={(e) => setErrorInput(e.target.value)}
              />
            </Card>

            <Card>
              <h3 className={theme.typography.h4 + ' mb-4'}>Disabled State</h3>
              <Input
                label="Disabled Input"
                type="text"
                value="Cannot edit this"
                disabled
              />
            </Card>
          </div>
        </section>

        {/* Badges Section */}
        <section className="mb-12">
          <h2 className={theme.typography.h2 + ' mb-6'}>Badges</h2>
          <Card>
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="danger">Inactive</Badge>
              <Badge variant="gray">Draft</Badge>
              <Badge variant="purple">Premium</Badge>
            </div>
            <div className="flex flex-wrap gap-3 items-center mt-4">
              <Badge variant="primary" size="sm">Small</Badge>
              <Badge variant="success" size="md">Medium</Badge>
              <Badge variant="warning" size="lg">Large</Badge>
            </div>
          </Card>
        </section>

        {/* Loading States Section */}
        <section className="mb-12">
          <h2 className={theme.typography.h2 + ' mb-6'}>Loading Skeletons</h2>
          <div className={theme.spacing.grid3}>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </section>

        {/* Gradients Section */}
        <section className="mb-12">
          <h2 className={theme.typography.h2 + ' mb-6'}>Gradient Cards</h2>
          <div className={theme.spacing.grid3}>
            <Card
              variant="gradient"
              className={theme.gradients.primary}
            >
              <h3 className="text-2xl font-bold mb-2">Primary Gradient</h3>
              <p className="text-blue-100">Beautiful gradient background</p>
            </Card>

            <Card
              variant="gradient"
              className={theme.gradients.success}
            >
              <h3 className="text-2xl font-bold mb-2">Success Gradient</h3>
              <p className="text-green-100">For positive actions</p>
            </Card>

            <Card
              variant="gradient"
              className={theme.gradients.purple}
            >
              <h3 className="text-2xl font-bold mb-2">Purple Gradient</h3>
              <p className="text-purple-100">Premium feel</p>
            </Card>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-12">
          <h2 className={theme.typography.h2 + ' mb-6'}>Typography</h2>
          <Card>
            <h1 className={theme.typography.h1}>Heading 1</h1>
            <h2 className={theme.typography.h2 + ' mt-4'}>Heading 2</h2>
            <h3 className={theme.typography.h3 + ' mt-4'}>Heading 3</h3>
            <h4 className={theme.typography.h4 + ' mt-4'}>Heading 4</h4>
            <p className={theme.typography.body + ' mt-4'}>
              Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p className={theme.typography.bodySm + ' mt-2'}>
              Small text - Supporting information or metadata
            </p>
            <p className={theme.typography.bodyXs + ' mt-2'}>
              Extra small text - Captions and footnotes
            </p>
          </Card>
        </section>

        {/* Performance Note */}
        <Card className="bg-blue-50 border-blue-200">
          <h3 className={theme.typography.h4 + ' text-blue-900 mb-2'}>
            ⚡ Performance Optimized
          </h3>
          <p className="text-blue-800">
            All animations use only <code className="bg-blue-100 px-2 py-1 rounded">transform</code> and{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">opacity</code> properties for GPU acceleration.
            This ensures smooth 60fps animations without CPU overhead.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemDemo;
