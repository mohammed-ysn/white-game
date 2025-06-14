import type { WordCategory } from '@white-game/shared';

export const wordLists: Record<WordCategory, string[]> = {
  animals: [
    'Lion', 'Elephant', 'Penguin', 'Dolphin', 'Eagle', 'Kangaroo', 'Panda', 'Tiger',
    'Giraffe', 'Zebra', 'Monkey', 'Bear', 'Wolf', 'Fox', 'Rabbit', 'Squirrel',
    'Owl', 'Hawk', 'Shark', 'Whale', 'Octopus', 'Turtle', 'Crocodile', 'Snake',
  ],
  foods: [
    'Pizza', 'Burger', 'Pasta', 'Sushi', 'Taco', 'Salad', 'Soup', 'Sandwich',
    'Rice', 'Noodles', 'Bread', 'Cheese', 'Chicken', 'Fish', 'Steak', 'Vegetables',
    'Fruit', 'Ice cream', 'Cake', 'Cookies', 'Chocolate', 'Coffee', 'Tea', 'Juice',
  ],
  objects: [
    'Phone', 'Computer', 'Book', 'Chair', 'Table', 'Lamp', 'Clock', 'Mirror',
    'Camera', 'Bicycle', 'Car', 'Plane', 'Train', 'Boat', 'Guitar', 'Piano',
    'Ball', 'Shoe', 'Hat', 'Glasses', 'Watch', 'Pen', 'Paper', 'Bag',
  ],
  places: [
    'Beach', 'Mountain', 'Forest', 'Desert', 'City', 'Village', 'Island', 'Lake',
    'River', 'Ocean', 'Park', 'Museum', 'Library', 'School', 'Hospital', 'Airport',
    'Restaurant', 'Hotel', 'Cinema', 'Theatre', 'Stadium', 'Mall', 'Market', 'Temple',
  ],
  activities: [
    'Swimming', 'Running', 'Dancing', 'Singing', 'Reading', 'Writing', 'Cooking', 'Painting',
    'Drawing', 'Playing', 'Sleeping', 'Walking', 'Talking', 'Listening', 'Working', 'Studying',
    'Shopping', 'Travelling', 'Hiking', 'Camping', 'Fishing', 'Cycling', 'Driving', 'Flying',
  ],
  movies: [
    'Titanic', 'Avatar', 'Star Wars', 'Harry Potter', 'Lord of the Rings', 'Marvel', 'Batman', 'Superman',
    'Jurassic Park', 'Matrix', 'Inception', 'Interstellar', 'Frozen', 'Toy Story', 'Shrek', 'Finding Nemo',
    'The Godfather', 'Pulp Fiction', 'Forrest Gump', 'The Shawshank Redemption', 'The Dark Knight', 'Fight Club', 'Gladiator', 'Braveheart',
  ],
  books: [
    'Harry Potter', 'Lord of the Rings', 'Game of Thrones', 'The Hobbit', 'Pride and Prejudice', '1984', 'To Kill a Mockingbird', 'The Great Gatsby',
    'Romeo and Juliet', 'Hamlet', 'Macbeth', 'The Odyssey', 'The Iliad', 'Don Quixote', 'Moby Dick', 'War and Peace',
    'The Catcher in the Rye', 'The Hunger Games', 'Twilight', 'The Da Vinci Code', 'The Alchemist', 'Life of Pi', 'The Kite Runner', 'The Book Thief',
  ],
};

export function getRandomWord(category?: WordCategory): string {
  const categories = Object.keys(wordLists) as WordCategory[];
  const selectedCategory = category || categories[Math.floor(Math.random() * categories.length)];
  const words = wordLists[selectedCategory];
  return words[Math.floor(Math.random() * words.length)];
}

export function getAllCategories(): WordCategory[] {
  return Object.keys(wordLists) as WordCategory[];
}