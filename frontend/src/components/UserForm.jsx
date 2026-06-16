import { useState } from "react"

function UserForm() {

  const [formData, setFormData] = useState({
    name: "",
    age: ""
  })

  const [result, setResult] = useState(null)

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    const response = await fetch(
      "http://localhost:8000/predict",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          ...formData,
          age: Number(formData.age)
        })

      }
    )

    const data = await response.json()

    setResult(data)

  }

  return (

    <div>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
        />

        <br />
        <br />

        <button type="submit">
          Submit
        </button>

      </form>

      <hr />

      {
        result && (
          <div>

            <h2>{result.message}</h2>
            <p>Age: {result.age}</p>

          </div>
        )
      }

    </div>

  )

}

export default UserForm