const BlogCard = ({ title, excerpt, date, imageUrl }) => {
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      {imageUrl && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-48"
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{date}</span>
          <button className="text-gray-900 hover:text-gray-700 font-medium">
            Read more →
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogCard; 