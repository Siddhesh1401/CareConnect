import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Target, 
  Award, 
  ArrowRight,
  CheckCircle,
  Globe,
  Zap,
  Shield
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AboutPage: React.FC = () => {
  const stats = [
    { label: 'Active Volunteers', value: '15,000+', icon: Users },
    { label: 'Partner NGOs', value: '500+', icon: Heart },
    { label: 'Events Completed', value: '2,500+', icon: Target },
    { label: 'Lives Impacted', value: '100,000+', icon: Award }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Impact-Driven',
      description: 'Every feature we build is designed to maximize social impact and create meaningful change in communities.'
    },
    {
      icon: Users,
      title: 'Community-Centric',
      description: 'We believe in the power of collective action and foster connections between passionate individuals and organizations.'
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'We maintain the highest standards of transparency in all operations, ensuring trust between all stakeholders.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We leverage technology to solve social problems and make volunteering more accessible and effective.'
    }
  ];

  const team = [
    {
      name: 'Priya Sharma',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Former social worker with 10+ years of experience in community development and NGO management.'
    },
    {
      name: 'Rahul Kumar',
      role: 'CTO',
      image: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Tech entrepreneur passionate about using technology for social good. Previously led engineering at multiple startups.'
    },
    {
      name: 'Sneha Patel',
      role: 'Head of Partnerships',
      image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Expert in building strategic partnerships with NGOs and social organizations across India.'
    },
    {
      name: 'Amit Singh',
      role: 'Head of Community',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Community building specialist focused on creating engaging experiences for volunteers and organizations.'
    }
  ];

  const milestones = [
    {
      year: '2022',
      title: 'Platform Launch',
      description: 'CareConnect was founded with a mission to bridge the gap between volunteers and NGOs.'
    },
    {
      year: '2023',
      title: 'First 1000 Volunteers',
      description: 'Reached our first major milestone with 1000 active volunteers and 50 partner NGOs.'
    },
    {
      year: '2024',
      title: 'National Expansion',
      description: 'Expanded operations to 10 major cities across India with 10,000+ volunteers.'
    },
    {
      year: '2025',
      title: 'Impact at Scale',
      description: 'Facilitating 15,000+ volunteers working with 500+ NGOs, impacting 100,000+ lives.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              About CareConnect
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to create the world's largest community of changemakers, 
              connecting passionate volunteers with impactful organizations to build a better tomorrow.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To democratize social impact by creating a seamless platform that connects 
                volunteers with meaningful opportunities, empowers NGOs with better resources, 
                and builds stronger communities through collective action.
              </p>
              <div className="space-y-4">
                {[
                  'Make volunteering accessible to everyone',
                  'Empower NGOs with digital tools and resources',
                  'Create transparent and accountable social impact',
                  'Build lasting communities around shared values'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/6995167/pexels-photo-6995167.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Volunteers working together"
                className="rounded-2xl shadow-lg w-full h-96 object-cover border border-blue-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center h-full">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
                  <value.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a simple idea to a platform that's changing lives across India
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-100"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="p-6">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </Card>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate individuals dedicated to creating positive social impact through technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-blue-100"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <div className="text-blue-600 font-medium mb-3">{member.role}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of volunteers and hundreds of NGOs who are already creating 
              positive change through our platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  <Users className="mr-2 w-5 h-5" />
                  Join as Volunteer
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Globe className="mr-2 w-5 h-5" />
                  Register NGO
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};