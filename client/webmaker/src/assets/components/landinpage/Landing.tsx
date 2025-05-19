 import Header from "./Header"; // Add this import at the top

const Landingpage= ()=>{

 return (
    <> 
 <div className="min-h-screen relative overflow-hidden bg-gray-900">
       {/* Circular radial gradient background */}
       <div className="absolute inset-0 flex items-center justify-center -z-10">
         <div className="w-[120vw] h-[120vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-700 via-gray-900 to-gray-900 opacity-80"></div>
       </div>
       <Header/>
       <div className="flex flex-col items-center justify-center min-h-[80vh]">
         <h1 className="text-3xl md:text-5xl font-bold text-center text-white drop-shadow-lg">
           What do you want to build?
           <br />
           <span className="text-lg font-normal text-gray-300">
             Prompt, run, edit, and deploy full-stack web and mobile apps.
           </span>
         </h1>
         <input
           type="text"
           placeholder="Describe your project idea..."
           className="mt-10 px-6 py-10 rounded-xl border-none shadow-xl bg-gray-800/80 backdrop-blur-md focus:outline-none focus:ring-4 focus:ring-purple-500 w-full max-w-md text-lg text-white placeholder-gray-400 transition"
         />
       </div>
    </div>
    </>
 )
}
export default Landingpage