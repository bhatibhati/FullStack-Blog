import BlogCard from '../components/BlogCard';

const Homepage = () => {
    const posts = [
        {
            id: 1,
            title: "Getting Started with React",
            excerpt: "Learn the basics of React and how to create your first component. This guide will walk you through the essential concepts and best practices.",
            date: "January 6, 2024",
            imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 2,
            title: "The Art of Minimal Design",
            excerpt: "Exploring the principles of minimal design in web development. Discover how less can truly be more in creating elegant user interfaces.",
            date: "January 5, 2024",
            imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 3,
            title: "Writing Clean Code",
            excerpt: "Best practices for writing maintainable and clean code. Learn the principles that make code more readable and easier to maintain.",
            date: "January 4, 2024",
            imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630ec2f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the Blog</h1>
                <p className="text-xl text-gray-600">Discover stories, thinking, and expertise from writers on any topic.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => (
                    <BlogCard key={post.id} {...post} />
                ))}
            </div>
        </div>
    );
};

export default Homepage; 